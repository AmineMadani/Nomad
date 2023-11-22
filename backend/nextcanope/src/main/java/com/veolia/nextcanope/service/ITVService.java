package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.itv.*;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.*;
import com.veolia.nextcanope.repository.ItvRepository;
import com.veolia.nextcanope.repository.ItvVersionAliasRepository;
import com.veolia.nextcanope.repository.ItvVersionEnumRepository;
import com.veolia.nextcanope.repository.ItvVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ITVService {

    @Autowired
    ItvVersionRepository itvVersionRepository;

    @Autowired
    ItvVersionEnumRepository itvVersionEnumRepository;

    @Autowired
    ItvVersionAliasRepository itvVersionAliasRepository;

    @Autowired
    ItvRepository itvRepository;

    @Autowired
    UserService userService;

    SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat sdfHour = new SimpleDateFormat("HH:mm");

    public void importItv(MultipartFile file, Long userId) throws IOException {
        String name = file.getOriginalFilename();
        String extension = name.substring(name.lastIndexOf(".") + 1);

        ReadResultDto readResultDto;
        if ("txt".equals(extension.toLowerCase())) {
            readResultDto = readTxtFile(file);
        } else if ("xml".equals(extension.toLowerCase())) {
            readResultDto = readXmlFile(file);
        } else {
            throw new FunctionalException("Le type de fichier n'est pas géré dans l'intégration.");
        }

        List<ItvBlockDto> listItvBlockDto = readResultDto.getListItvBlockDto();
        String decimalSeparator = readResultDto.getDecimalSeparator();

        // Get referential data
        List<ItvVersionAlias> listItvVersionAlias = itvVersionAliasRepository.findAll();
        List<ItvVersionDto> listItvVersion = getListItvVersion();

        // For each block
        for (ItvBlockDto itvBlockDto : listItvBlockDto) {
            if (itvBlockDto.getError() == null) {
                // Check the validity of the datas
                try {
                    checkValidityBlock(itvBlockDto, listItvVersionAlias, listItvVersion, decimalSeparator);
                } catch (Exception e) {
                    itvBlockDto.setError("ERREUR dans le bloc débutant en ligne " + itvBlockDto.getStartLine() + ". " + e.getMessage());
                }
            }

            if (itvBlockDto.getError() == null) {
                // Get the downstream and upstream assets
                itvBlockDto.getMapB().get("AAD");
                itvBlockDto.getMapB().get("AAF");

                // Get the asset
                itvBlockDto.getMapB().get("AAB");
            }
        }

        saveItv(file.getOriginalFilename(), listItvBlockDto, userId);
    }

    public ReadResultDto readTxtFile(MultipartFile file) throws IOException {
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);

        // Convert file to list of line
        List<String> listLine = Arrays.asList(content.split("\r\n"));

        // ### HEADER ### //
        // Read the header first, the lines start with #A
        String fileEncoding = "";
        String language = "";
        String fieldSeparator = "";
        String decimalSeparator = "";
        String textSurroundingChar = "";
        int nbA1 = 0;
        int nbA2 = 0;
        int nbA3 = 0;
        int nbA4 = 0;
        int nbA5 = 0;
        int nbA6 = 0;

        for (String l : listLine) {
            String line = l.trim();

            if (line.startsWith("#A")) {
                // Get the subtype from the number after the type
                String code = line.substring(0, line.indexOf("="));
                String value = line.substring(line.indexOf("=") + 1).trim();

                switch (code) {
                    case "#A1":
                        fileEncoding = value;
                        nbA1++;
                        break;
                    case "#A2":
                        language = value;
                        nbA2++;
                        break;
                    case "#A3":
                        fieldSeparator = value;
                        nbA3++;
                        break;
                    case "#A4":
                        decimalSeparator = value;
                        nbA4++;

                        if (!",".equals(decimalSeparator) && !".".equals(decimalSeparator)) {
                            throw new FunctionalException("Le séparateur décimal doit être \".\" ou \",\". Valeur trouvée : '" + decimalSeparator + "'");
                        }
                        break;
                    case "#A5":
                        textSurroundingChar = value;
                        nbA5++;
                        break;
                    case "#A6":
                        // No use
                        nbA6++;
                        break;
                    default:
                        throw new FunctionalException("L'en-tête contient l'identifiant " + code + " qui n'est pas prévu par la norme.");
                }
            }
        }

        // Check that all the header fields have values
        if (
                "".equals(fileEncoding)
                || "".equals(language)
                || "".equals(fieldSeparator)
                || "".equals(decimalSeparator)
                || "".equals(textSurroundingChar)
        ) {
            throw new FunctionalException("Format de fichier incorrect : l'un des codes d'entête est absent (#A1 à #A5). Le traitement est impossible.");
        }

        // Check that all header fields are present only once
        if (
                nbA1 > 1
                || nbA2 > 1
                || nbA3 > 1
                || nbA4 > 1
                || nbA5 > 1
                || nbA6 > 1
        ) {
            throw new FunctionalException("Un des codes d'entête est renseigné plusieurs fois.");
        }

        // Check that the field separator, decimal separator and text surrounding char are all differents
        if (
                fieldSeparator.equals(decimalSeparator)
                || decimalSeparator.equals(textSurroundingChar)
                || textSurroundingChar.equals(fieldSeparator)
        ) {
            throw new FunctionalException("Les séparateurs décimaux, de champs et de texte doivent être différents.");
        }

        // ### DATA ### //
        List<ItvBlockDto> listItvBlockDto = new ArrayList<>();

        for (int i = 0; i < listLine.size() ; i++) {
            String line = listLine.get(i).trim();

            if (line.startsWith("#A") || line.startsWith("#Z")) continue;

            if (line.startsWith("#B") || line.startsWith("#C") ) {
                // Its the start of a block
                // Search the end of it
                Integer endIndex = getNextIndexOfValue(listLine, i + 1, false, false, true);

                if (endIndex == null) {
                    ItvBlockDto itvBlockDto = new ItvBlockDto();
                    itvBlockDto.setError("ERREUR dans le bloc débutant en ligne " + i + ". " + "Le block ne se fini pas.");
                    listItvBlockDto.add(itvBlockDto);
                    break;
                }

                // Get the list of line composing the block
                List<String> listLineBlock = listLine.subList(i, endIndex + 1);

                // Read the block
                ItvBlockDto itvBlockDto;
                try {
                    itvBlockDto = readBlock(listLineBlock, fieldSeparator, textSurroundingChar);
                } catch (Exception e) {
                    itvBlockDto = new ItvBlockDto();
                    itvBlockDto.setError("ERREUR dans le bloc débutant en ligne " + i + ". " + e.getMessage());
                }

                itvBlockDto.setStartLine(i);

                listItvBlockDto.add(itvBlockDto);

                // Go the next block
                i = endIndex;
            } else {
                throw new FunctionalException("Le fichier contient l'identifiant " + line.substring(0, 2) + " qui n'est pas prévu par les versions de la norme gérées par l'application.");
            }
        }

        ReadResultDto readResultDto = new ReadResultDto();
        readResultDto.setListItvBlockDto(listItvBlockDto);
        readResultDto.setDecimalSeparator(decimalSeparator);
        return readResultDto;
    }


    /**
     * A block looks like that :
     * #B01=AAA,BBB,CCC         <-- AAA is the code the first field, BBB the code of the second etc.
     * aaaa,bbbb,cccc           <-- aaaa is the value of the first field, bbbb the value of the second etc.
     * #B02=DDD,EEE,FFF
     * dddd,eeee,ffff
     * #C=GGG,HHH,III
     * gggg,hhhh,iiii
     * gggg,hhhh,iiii
     * #Z                       <-- End of a block
     * @param listLine List of the line of the block
     * @param fieldSeparator The char serving as field separator
     * @return A dto containing the values for each type
     *  Example :
     *      mapB = {"AAA": "aaaa", "BBB": "bbbb", "CCC": "cccc", "DDD": "dddd", "eeee": "eeee", "FFF": "ffff"}
     *      listMapC = [{"GGG": "gggg", "HHH": "hhhh", "III": "iiii"}, {"GGG": "gggg", "HHH": "hhhh", "III": "iiii"}]
     */
    private ItvBlockDto readBlock(List<String> listLine, String fieldSeparator, String textSurroundingChar) {
        Map<String, String> mapB = new HashMap<>();
        List<Map<String, String>> listMapC = new ArrayList<>();

        for (int i = 0; i < listLine.size() ; i++) {
            String line = listLine.get(i).trim();

            if (line.startsWith("#B") || line.startsWith("#C")) {
                // Get the type (#BXXX or #C)
                String type = line.substring(0, line.indexOf("="));

                // Get the list of field code
                List<String> listFieldCode = Arrays.asList(line.substring(line.indexOf("=") + 1).trim().split(fieldSeparator));

                // Search the end of the value
                Integer endIndex = getNextIndexOfValue(listLine, i + 1, true, true, true);

                if (endIndex == null) {
                    throw new FunctionalException("Le block de type " + type + " ne se fini pas.");
                }

                // Get the list of values
                List<String> listLineValue = listLine.subList(i + 1, endIndex);

                // For each line of value
                for (String lineValue : listLineValue) {
                    // We split the line into a list of values according to the field separator
                    List<String> listValue = Arrays.stream(
                            lineValue.split(
                                    fieldSeparator + "(?=([^" + textSurroundingChar + "]*" + textSurroundingChar + "[^" + textSurroundingChar + "]*" + textSurroundingChar + ")*[^" + textSurroundingChar + "]*$)", -1))
                            .map(v -> {
                                if (v.startsWith("\"") && v.endsWith("\"")) v = v.substring(1, v.length() - 1);
                                return v.trim();
                            })
                            .collect(Collectors.toList());

                    // Check that the number of values is the same as the number of code
                    if (listFieldCode.size() != listValue.size()) {
                        throw new FunctionalException("Le bloc " + type + " n'a pas le même nombre de valeurs que de champs.");
                    }

                    // If it is a B line, add the value to the existing map
                    if (line.startsWith("#B")) {
                        for (int j = 0; j < listValue.size(); j++) {
                            String value = listValue.get(j);
                            if ("".equals(value)) value = null;
                            mapB.put(listFieldCode.get(j), value);
                        }
                    } else if (line.startsWith("#C")) {
                        // If its a C line,
                        // Put the values in a map and add it to the list
                        Map<String, String> hashMapValueByCode = new HashMap<>();

                        for (int j = 0; j < listValue.size(); j++) {
                            String value = listValue.get(j);
                            if ("".equals(value)) value = null;
                            hashMapValueByCode.put(listFieldCode.get(j), value);
                        }

                        listMapC.add(hashMapValueByCode);
                    }
                }

                // Go to the next type
                i = endIndex - 1; // -1 because the for does +1
            }

            if (line.startsWith("#Z")) {
                // End of block
                break; // No use because its the last line anyway
            }
        }

        return new ItvBlockDto(mapB, listMapC);
    }

    private Integer getNextIndexOfValue(List<String> listLine, int startIndex, boolean searchBType, boolean searchCType, boolean searchZType) {
        Integer foundIndex = null;
        for (int i = startIndex; i < listLine.size() ; i++) {
            String line = listLine.get(i).trim();

            if (
                    (searchBType && line.startsWith("#B"))
                    || (searchCType && line.startsWith("#C"))
                    || (searchZType && line.startsWith("#Z"))
            ) {
                foundIndex = i;
                break;
            }

        }

        return foundIndex;
    }

    /**
     * A block looks like that :
     * <ZB>                         <-- Start of block
     *      <AAA>aaaa</AAA>         <-- AAA is the code the field, aaaa is the value of the field
     *      <BBB>bbbb</BBB>         <-- BBB is the code the field, bbbb is the value of the field
     *      <ZC>
     *          <GGG>gggg</GGG>     <-- GGG is the code the field, gggg is the value of the field
     *          <HHH>hhhh</HHH>     <-- HHH is the code the field, hhhh is the value of the field
     *      </ZC>
     *      <ZC>
     *          <GGG>gggg</GGG>     <-- GGG is the code the field, gggg is the value of the field
     *          <HHH>hhhh</HHH>     <-- HHH is the code the field, hhhh is the value of the field
     *      </ZC>
     * </ZB>                        <-- End of block
     */
    public ReadResultDto readXmlFile(MultipartFile file) {
        List<ItvBlockDto> listItvBlockDto = new ArrayList<>();

        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);

            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(file.getInputStream());
            doc.getDocumentElement().normalize();

            // ### HEADER ### //
            String language = "";
            String docVersion = "";
            int nbA2 = 0;
            int nbA6 = 0;

            NodeList listBlockA = doc.getElementsByTagName("ZA");
            for (int i = 0; i < listBlockA.getLength(); i++) {
                Node nodeA = listBlockA.item(i);

                if (nodeA.getNodeType() == Node.ELEMENT_NODE) {
                    Element elementA = (Element) nodeA;

                    NodeList listNodeFieldA = elementA.getChildNodes();
                    for (int k = 0; k < listNodeFieldA.getLength(); k++) {
                        Node nodeFieldB = listNodeFieldA.item(k);
                        String code = nodeFieldB.getNodeName();
                        String value = nodeFieldB.getTextContent();

                        if (!"#text".equals(code)) {
                            if ("A2".equals(code)) {
                                language = value;
                                nbA2++;
                            } else if ("A6".equals(code)) {
                                docVersion = value;
                                nbA6++;
                            } else {
                                throw new FunctionalException("L'en-tête contient l'identifiant " + code + " qui n'est pas prévu par la norme.");
                            }
                        }
                    }
                }
            }

            // Check that all the header fields have values
            if ("".equals(language) || "".equals(docVersion)) {
                throw new FunctionalException("Format de fichier incorrect : l'un des codes d'entête est absent (A2 ou A6). Le traitement est impossible.");
            }

            // Check that all header fields are present only once
            if (nbA2 > 1 || nbA6 > 1) {
                throw new FunctionalException("Un des codes d'entête est renseigné plusieurs fois.");
            }

            // ### DATA ### //
            NodeList listBlockB = doc.getElementsByTagName("ZB");
            for (int i = 0; i < listBlockB.getLength(); i++) {
                Node nodeB = listBlockB.item(i);

                if (nodeB.getNodeType() == Node.ELEMENT_NODE) {
                    Element elementB = (Element) nodeB;

                    ItvBlockDto itvBlockDto = new ItvBlockDto();

                    NodeList listNodeFieldB = elementB.getChildNodes();
                    Map<String, String> mapB = new HashMap<>();
                    for (int k = 0; k < listNodeFieldB.getLength(); k++) {
                        Node nodeFieldB = listNodeFieldB.item(k);
                        String code = nodeFieldB.getNodeName();
                        String value = nodeFieldB.getTextContent();

                        if (!"#text".equals(code) && !"ZC".equals(code)) {
                            mapB.put(code, value);
                        }
                    }

                    itvBlockDto.setMapB(mapB);

                    // C
                    NodeList listBlockC = elementB.getElementsByTagName("ZC");

                    List<Map<String, String>> listMapC = new ArrayList<>();
                    for (int j = 0; j < listBlockC.getLength(); j++) {
                        Node nodeC = listBlockC.item(j);
                        if (nodeC.getNodeType() == Node.ELEMENT_NODE) {
                            Element elementC = (Element) nodeC;
                            elementC.getElementsByTagName("ZC").item(0);
                            NodeList listNodeFieldC = elementC.getChildNodes();

                            Map<String, String> mapC = new HashMap<>();
                            for (int k = 0; k < listNodeFieldC.getLength(); k++) {
                                Node nodeFieldC = listNodeFieldC.item(k);
                                String code = nodeFieldC.getNodeName();
                                String value = nodeFieldC.getTextContent();

                                if (!"#text".equals(code)) mapC.put(code, value);
                            }
                            listMapC.add(mapC);
                        }
                    }

                    itvBlockDto.setListMapC(listMapC);

                    listItvBlockDto.add(itvBlockDto);
                }
            }
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new TechnicalException("Erreur lors de la lecture du fichier", e.getMessage());
        }

        ReadResultDto readResultDto = new ReadResultDto();
        readResultDto.setListItvBlockDto(listItvBlockDto);
        readResultDto.setDecimalSeparator(".");
        return readResultDto;
    }

    public List<ItvVersionDto> getListItvVersion() {
        List<ItvVersion> listItvVersion = itvVersionRepository.findAll();
        List<ItvVersionEnumDto> listItvVersionEnum = itvVersionEnumRepository.getListItvVersionEnum();

        Map<String, List<ItvVersionFieldDto>> mapListItvVersionFieldByVersion = new HashMap<>();
        for (ItvVersion itvVersion : listItvVersion) {
            List<ItvVersionFieldDto> listItvVersionField = mapListItvVersionFieldByVersion.get(itvVersion.getVersion());
            if (listItvVersionField == null) {
                listItvVersionField = new ArrayList<>();
                mapListItvVersionFieldByVersion.put(itvVersion.getVersion(), listItvVersionField);
            }

            ItvVersionFieldDto itvVersionFieldDto = new ItvVersionFieldDto();
            itvVersionFieldDto.setCode(itvVersion.getCode());
            itvVersionFieldDto.setLabel(itvVersion.getLabel());
            itvVersionFieldDto.setParent(itvVersion.getParent());
            itvVersionFieldDto.setType(itvVersion.getType());
            itvVersionFieldDto.setListItvVersionEnum(
                    listItvVersionEnum.stream().filter(e -> e.getVersion().equals(itvVersion.getVersion())
                            && e.getCode().equals(itvVersion.getCode())).collect(Collectors.toList())
            );

            listItvVersionField.add(itvVersionFieldDto);
        }

        List<ItvVersionDto> listItvVersionDto = new ArrayList<>();
        for(String version : mapListItvVersionFieldByVersion.keySet()) {
            ItvVersionDto itvVersionDto = new ItvVersionDto();
            itvVersionDto.setVersion(version);
            itvVersionDto.setListItvVersionField(mapListItvVersionFieldByVersion.get(version));
            listItvVersionDto.add(itvVersionDto);
        }

        return listItvVersionDto;
    }

    /**
     * Check the validity of the block
     * @param itvBlockDto A dto containing the map of value for B, and a list of values for C
     * @param listItvVersionAlias List of correspondence version alias <> version
     * @param listItvVersion List of ITV fields definition by version
     */
    private void checkValidityBlock(
            ItvBlockDto itvBlockDto, List<ItvVersionAlias> listItvVersionAlias, List<ItvVersionDto> listItvVersion,
            String decimalSeparator
    ) {
        Map<String, String> mapB = itvBlockDto.getMapB();
        List<Map<String, String>> listMapC = itvBlockDto.getListMapC();

        // A C type (Observations) can't be present if there is no B type (Inspections)
        if (mapB.keySet().size() == 0 && listMapC.size() > 0) {
            throw new FunctionalException("On ne peut pas faire d'observation (bloc #C) sans avoir fait d'inspection (bloc #B).");
        }

        // ### Get the version ### //
        ItvVersionDto itvVersionDto = null;
        if (mapB.keySet().size() > 0) {
            // ## The version code has to be present ## //
            String versionCode = mapB.get("ABA");
            if (versionCode == null) {
                throw new FunctionalException("Le code de version (ABA) est absent du bloc.");
            }

            // ## Get the version from the version code ## //
            ItvVersionAlias itvVersionAlias = listItvVersionAlias.stream().filter(va -> versionCode.equals(va.getLabel())).findFirst().orElse(null);
            if (itvVersionAlias == null) {
                throw new FunctionalException("Le code de version (ABA) référence une norme non gérée (" + versionCode + ").");
            }

            // ## Check that the version is managed ## //
            itvVersionDto = listItvVersion.stream().filter(v -> itvVersionAlias.getVersion().equals(v.getVersion())).findFirst().orElse(null);
            if (itvVersionDto == null) {
                throw new FunctionalException("Le code de version (ABA) référence une version de la norme non gérée (" + versionCode + ").");
            }
        }

        // ### Check B ### //
        if (mapB.keySet().size() > 0) {
            // ## Check each field ## //
            List<ItvVersionFieldDto> listItvVersionFieldB = itvVersionDto.getListItvVersionField().stream().filter(f -> "B".equals(f.getParent())).collect(Collectors.toList());
            for (String fieldCode : mapB.keySet()) {
                // # Check that the code is found in the version # //
                ItvVersionFieldDto itvVersionField = listItvVersionFieldB.stream().filter(f -> fieldCode.equals(f.getCode())).findFirst().orElse(null);
                if (itvVersionField == null) {
                    // If not, check if this field is found in another type
                    itvVersionField = itvVersionDto.getListItvVersionField().stream().filter(f -> fieldCode.equals(f.getCode())).findFirst().orElse(null);
                    if (itvVersionField == null) {
                        throw new FunctionalException("Le bloc #B contient un champ " + fieldCode + " non prévu par la norme.");
                    } else {
                        throw new FunctionalException("Le champ " + fieldCode + " n'est pas permis dans un bloc #B, uniquement dans un bloc #" + itvVersionField.getParent());
                    }
                }

                // # Check the value of the field # //
                String value = mapB.get(fieldCode);
                checkValue("B", value, fieldCode, null, decimalSeparator, itvVersionField);
            }
        }

        // ### Check C ### //
        if (listMapC.size() > 0) {
            for (Map<String, String> mapC : listMapC) {
                // ## C has to have a field A ## //
                if (mapC.get("A") == null) {
                    throw new FunctionalException("Le bloc #C n'a pas d'identifiant principal (champ A).");
                }
                String valueA = mapC.get("A");

                // ## Check each field ## //
                List<ItvVersionFieldDto> listItvVersionFieldC = itvVersionDto.getListItvVersionField().stream().filter(f -> "C".equals(f.getParent())).collect(Collectors.toList());
                for (String fieldCode : mapC.keySet()) {
                    // # Check that the code is found in the version # //
                    ItvVersionFieldDto itvVersionField = listItvVersionFieldC.stream().filter(f -> fieldCode.equals(f.getCode())).findFirst().orElse(null);
                    if (itvVersionField == null) {
                        // If not, check if this field is found in another type
                        itvVersionField = itvVersionDto.getListItvVersionField().stream().filter(f -> fieldCode.equals(f.getCode())).findFirst().orElse(null);
                        if (itvVersionField == null) {
                            throw new FunctionalException("Le bloc #C contient un champ " + fieldCode + " non prévu par la norme.");
                        } else {
                            throw new FunctionalException("Le champ " + fieldCode + " n'est pas permis dans un bloc #C, uniquement dans un bloc #" + itvVersionField.getParent());
                        }
                    }

                    // # Check the value of the field # //
                    String value = mapC.get(fieldCode);
                    String condition = "A=" + valueA;
                    // No condition for field A
                    if ("A".equals(fieldCode)) condition = null;

                    checkValue("C", value, fieldCode, condition, decimalSeparator, itvVersionField);
                }
            }
        }
    }

    public void checkValue(String type, String value, String fieldCode, String condition, String decimalSeparator, ItvVersionFieldDto itvVersionField) {
        if (value != null) {
            // Enum
            if ("E".equals(itvVersionField.getType())) {
                String finalValue = value;

                if (condition == null) {
                    ItvVersionEnumDto itvVersionEnum = itvVersionField.getListItvVersionEnum().stream()
                            .filter(e -> finalValue.equals(e.getVal()))
                            .findFirst().orElse(null);
                    if (itvVersionEnum == null) {
                        throw new FunctionalException("La valeur " + value + " n'est pas permise dans un champ " + fieldCode + " de bloc #" + type + ".");
                    }
                } else {
                    ItvVersionEnumDto itvVersionEnum = itvVersionField.getListItvVersionEnum().stream()
                            .filter(e -> finalValue.equals(e.getVal()) && condition.equals(e.getCondition()))
                            .findFirst().orElse(null);
                    if (itvVersionEnum == null) {
                        throw new FunctionalException("La valeur " + value + " n'est pas permise dans un champ " + fieldCode + " de bloc #" + type + " lorsque " + condition + ".");
                    }
                }
            }

            // Date
            if ("D".equals(itvVersionField.getType())) {
                // It has to be in the format YYYY-MM-DD
                try {
                    sdfDate.parse(value);
                } catch (Exception e) {
                    // Invalid date
                    throw new FunctionalException("La valeur " + value + " du champ " + fieldCode + " de #" + type + " n'est pas une date au format SSYY-MM-DD prévu par la norme.");
                }
            }

            // Hour
            if ("H".equals(itvVersionField.getType())) {
                // It has to be in the format HH:MM (or HH:MM:SS but we dont care about the seconds)
                String[] listTime = value.split(":");
                if (listTime.length == 3) {
                    value = listTime[0] + ":" + listTime[1];
                }
                try {
                    sdfHour.parse(value);
                } catch (Exception e) {
                    // Invalid hour
                    throw new FunctionalException("La valeur " + value + " du champ " + fieldCode + " de #" + type + " n'est pas une heure au format hh:mm prévu par la norme.");
                }
            }

            // Number
            if ("N".equals(itvVersionField.getType())) {
                try {
                    Double.valueOf(value.replace(decimalSeparator, "."));
                } catch (Exception e) {
                    // Invalid number
                    throw new FunctionalException("La valeur " + value + " du champ " + fieldCode + " de #" + type + " n'est pas une valeur numérique correcte (le séparateur décimal est " + decimalSeparator + ").");
                }
            }
        }
    }

    private Itv saveItv(String filename, List<ItvBlockDto> listItvBlockDto, Long userId) {
        // Save the ITV
        Users user = userService.getUserById(userId);

        Itv itv = new Itv();
        itv.setItvFilename(filename);
        itv.setItvStatus(Itv.STATUS_IMPORT);
        itv.setCreatedBy(user);
        itv.setModifiedBy(user);
        itv.setListOfItvPicture(new ArrayList<>());
        itv.setListOfItvBlock(new ArrayList<>());

        for (ItvBlockDto itvBlockDto : listItvBlockDto) {
            ItvBlock itvBlock = new ItvBlock();
            //itvBlock.setItbObjRef();
            //itvBlock.setLayer();
            itvBlock.setItv(itv);
            itvBlock.setListOfItvBlockData(new ArrayList<>());

            for (String code : itvBlockDto.getMapB().keySet()) {
                ItvBlockData itvBlockData = new ItvBlockData();
                itvBlockData.setIbdParent(ItvBlockData.PARENT_B);
                itvBlockData.setIbdLine(null); // Only 1 line for B
                itvBlockData.setIbdCode(code);
                itvBlockData.setIbdValue(itvBlockDto.getMapB().get(code));
                itvBlockData.setItvBlock(itvBlock);
                itvBlock.getListOfItvBlockData().add(itvBlockData);
            }

            int lineNb = 0;
            for (Map<String, String> mapC : itvBlockDto.getListMapC()) {
                lineNb++;

                for (String code : mapC.keySet()) {
                    ItvBlockData itvBlockData = new ItvBlockData();
                    itvBlockData.setIbdParent(ItvBlockData.PARENT_C);
                    itvBlockData.setIbdLine(lineNb);
                    itvBlockData.setIbdCode(code);
                    itvBlockData.setIbdValue(mapC.get(code));
                    itvBlockData.setItvBlock(itvBlock);
                    itvBlock.getListOfItvBlockData().add(itvBlockData);
                }
            }

            itv.getListOfItvBlock().add(itvBlock);
        }

        try {
            itv = itvRepository.save(itv);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde de l'ITV", e.getMessage());
        }

        return itv;
    }
}
