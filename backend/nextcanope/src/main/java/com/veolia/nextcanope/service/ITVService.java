package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.itv.*;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.*;
import com.veolia.nextcanope.repository.*;
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
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.math.BigDecimal;
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

    @Autowired
    LayerRepositoryImpl layerRepository;

    @Autowired
    ItvPictureRepository itvPictureRepository;

    @Autowired
    LayerService layerService;

    private List<ItvVersionDto> getListItvVersion() {
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

    /*
     * IMPORT
     */

    SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat sdfHour = new SimpleDateFormat("HH:mm");

    public Long importItv(MultipartFile file, Long userId) throws IOException {
        String name = file.getOriginalFilename();
        String extension = name.substring(name.lastIndexOf(".") + 1);

        // ### Read the file ### //
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

        // ### Check the validity of the datas ### //
        // Get referential data
        List<ItvVersionAlias> listItvVersionAlias = itvVersionAliasRepository.findAll();
        List<ItvVersionDto> listItvVersion = getListItvVersion();

        // For each block
        for (ItvBlockDto itvBlockDto : listItvBlockDto) {
            if (itvBlockDto.getError() == null) {
                try {
                    checkValidityBlock(itvBlockDto, listItvVersionAlias, listItvVersion, decimalSeparator);
                } catch (Exception e) {
                    itvBlockDto.setError("ERREUR dans le bloc débutant en ligne " + itvBlockDto.getStartLine() + ". " + e.getMessage());
                }
            }

            if (itvBlockDto.getError() == null) {
                // Get the asset
                itvBlockDto.setItbObjRef(itvBlockDto.getMapB().get("AAA"));

                // Get the layer
                // If no upstream assets, then its Branche else its Collecteur
                if (itvBlockDto.getMapB().get("AAF") == null)
                    itvBlockDto.setLyrTableName("ass_branche");
                else
                    itvBlockDto.setLyrTableName("ass_collecteur");
            }
        }

        // ### Save the ITV ### //
        Itv itv = saveItv(file.getOriginalFilename(), listItvBlockDto, userId);
        return itv.getId();
    }

    private ReadResultDto readTxtFile(MultipartFile file) throws IOException {
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
    private ReadResultDto readXmlFile(MultipartFile file) {
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
                            mapB.put(code, value != null && !"".equals(value) ? value.trim() : null);
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

                                if (!"#text".equals(code)) mapC.put(code, value != null && !"".equals(value) ? value.trim() : null);
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

                // # Convert number data (replace the decimalSeparator with a point) # //
                if (value != null && "N".equals(itvVersionField.getType())) {
                    mapB.put(fieldCode, value.replace(decimalSeparator, "."));
                }
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

                    // # Convert number data (replace the decimalSeparator with a point) # //
                    if (value != null && "N".equals(itvVersionField.getType())) {
                        mapB.put(fieldCode, value.replace(decimalSeparator, "."));
                    }
                }
            }
        }
    }

    private void checkValue(String type, String value, String fieldCode, String condition, String decimalSeparator, ItvVersionFieldDto itvVersionField) {
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

        Set<String> listPictureName = new HashSet<>();

        for (ItvBlockDto itvBlockDto : listItvBlockDto) {
            ItvBlock itvBlock = new ItvBlock();
            itvBlock.setItbObjRef(itvBlockDto.getItbObjRef());
            Layer layer = layerService.getLayerByLyrTableName(itvBlockDto.getLyrTableName());
            itvBlock.setLayer(layer);
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
            boolean hasStructuralDefect = false;
            boolean hasFunctionalDefect = false;
            boolean hasObservation = false;
            for (Map<String, String> mapC : itvBlockDto.getListMapC()) {
                lineNb++;

                for (String code : mapC.keySet()) {
                    String value = mapC.get(code);

                    ItvBlockData itvBlockData = new ItvBlockData();
                    itvBlockData.setIbdParent(ItvBlockData.PARENT_C);
                    itvBlockData.setIbdLine(lineNb);
                    itvBlockData.setIbdCode(code);
                    itvBlockData.setIbdValue(mapC.get(code));
                    itvBlockData.setItvBlock(itvBlock);
                    itvBlock.getListOfItvBlockData().add(itvBlockData);

                    // Pictures
                    if ("M".equals(code) && value != null) {
                        if (value.contains("/")) {
                            listPictureName.addAll(Arrays.asList(value.split("/")));
                        } else {
                            listPictureName.addAll(Arrays.asList(value.split(";")));
                        }
                    }

                    // Défault
                    if ("A".equals(code)) {
                        if (value != null && value.startsWith("BA")) {
                            hasStructuralDefect = true;
                        } else if (value != null && value.startsWith("BB")) {
                            hasFunctionalDefect = true;
                        } else {
                            hasObservation = true;
                        }
                    }
                }
            }

            itvBlock.setItbStructuralDefect(hasStructuralDefect);
            itvBlock.setItbFunctionalDefect(hasFunctionalDefect);
            itvBlock.setItbObservation(hasObservation);

            itv.getListOfItvBlock().add(itvBlock);
        }

        for (String pictureName : listPictureName) {
            ItvPicture itvPicture = new ItvPicture();
            itvPicture.setItpLabel(pictureName);
            itvPicture.setItpReference(null);
            itvPicture.setItv(itv);
            itvPicture.setCreatedBy(user);
            itv.getListOfItvPicture().add(itvPicture);
        }

        try {
            itv = itvRepository.save(itv);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde de l'ITV", e.getMessage());
        }

        return itv;
    }

    public void updateListItvPicture(List<ItvPictureUploadDto> listItvPictureDto, Long userId) {
        Users user = userService.getUserById(userId);

        List<ItvPicture> listItvPicture = itvPictureRepository.findAllById(
                listItvPictureDto.stream().map(ItvPictureUploadDto::getId).collect(Collectors.toList())
        );

        for (ItvPicture itvPicture : listItvPicture) {
            ItvPictureUploadDto itvPictureDto = listItvPictureDto.stream().filter(i -> i.getId().equals(itvPicture.getId())).findFirst().orElse(null);
            if (itvPictureDto != null) {
                itvPicture.setItpReference(itvPictureDto.getItpReference());
                itvPicture.setModifiedBy(user);
            }
        }

        try {
            itvPictureRepository.saveAll(listItvPicture);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la mise à jour des photos de l'ITV", e.getMessage());
        }
    }

    /*
     * EXPORT
     */

    SimpleDateFormat sdf = new SimpleDateFormat("ddMMyyyy_HHmmss");

    public ExportItvDto exportEmptyItvFile(List<AssetDto> listAsset, String fileType) throws ParserConfigurationException, TransformerException {
        // ### ITV Version ### //
        List<ItvVersionAlias> listItvVersionAlias = itvVersionAliasRepository.findAll();
        List<ItvVersionDto> listItvVersion = getListItvVersion();

        String version = "EN13508-2:2003+A1:2011";
        ItvVersionAlias itvVersionAlias = listItvVersionAlias.stream().filter(a -> a.getLabel().equals(version)).findFirst().orElse(null);
        if (itvVersionAlias == null) {
            throw new FunctionalException("Alias non trouvé");
        }

        ItvVersionDto itvVersionDto = listItvVersion.stream().filter(v -> v.getVersion().equals(itvVersionAlias.getVersion())).findFirst().orElse(null);
        if (itvVersionDto == null) {
            throw new FunctionalException("Version non trouvée");
        }

        // ### Assets data ### //
        // Regroup the asset by layer
        Map<String, List<String>> mapListIdByLayer = new HashMap<>();
        for(AssetDto assetDto : listAsset) {
            List<String> listId = mapListIdByLayer.get(assetDto.getLyrTableName());
            if (listId == null) {
                listId = new ArrayList<>();
                mapListIdByLayer.put(assetDto.getLyrTableName(), listId);
            }
            listId.add(assetDto.getId());
        }

        // Get the asset data for each layer
        Map<String, List<Map<String, Object>>> mapListAssetByLayer = new HashMap<>();
        for (String layer : mapListIdByLayer.keySet()) {
            List<Map<String, Object>> listResult = layerRepository.getAllAssetDataByListId(layer, mapListIdByLayer.get(layer));
            mapListAssetByLayer.put(layer, listResult);
        }

        // ### B ### //
        List<String> listBField = Arrays.asList("AAA","AAD","AAF","AAJ","AAN","ACA","ACB","ACD","ACK", "ABA");

        // ## For each Asset (Collecteur or Branche) ## //
        List<AssetDto> listAssetSection = listAsset.stream().filter(a -> a.getLyrTableName().equals("ass_collecteur") || a.getLyrTableName().equals("ass_branche")).collect(Collectors.toList());

        List<Map<String, Object>> listBData = new ArrayList<>();
        for (AssetDto assetDto : listAssetSection) {
            // Ge the asset data
            List<Map<String, Object>> listResult = mapListAssetByLayer.get(assetDto.getLyrTableName());
            Map<String, Object> mapAssetData = listResult.stream().filter(r -> assetDto.getId().equals(r.get("id"))).findFirst().orElse(null);
            if (mapAssetData == null) {
                throw new FunctionalException("Equipement " + assetDto.getId() + " pour le type " + assetDto.getLyrTableName() + " non trouvé");
            }

            // For each field to get
            Map<String, Object> mapData = new HashMap<>();
            for (String code : listBField) {
                // Get the field
                ItvVersionFieldDto itvVersionFieldDto = itvVersionDto.getListItvVersionField().stream().filter(f -> f.getParent().equals("B") && f.getCode().equals(code)).findFirst().orElse(null);
                if (itvVersionFieldDto == null) {
                    throw new FunctionalException("Code " + code + " non trouvé");
                }

                // Get the corresponding asset field code
                String fieldCode = itvVersionFieldDto.getLabel();

                // Exception, when its not the same field name depending of the layer
                if ("AAD".equals(code) && "ass_branche".equals(assetDto.getLyrTableName())) {
                    fieldCode = "id_arc";
                }
                // Exception, when there is no field for a layer
                if ("AAF".equals(code) && "ass_branche".equals(assetDto.getLyrTableName())) {
                    mapData.put(code, null);
                    continue;
                }
                // Version
                if ("ABA".equals(code)) {
                    mapData.put(code, version);
                    continue;
                }

                // # Data # //
                Object valueObject = mapAssetData.get(fieldCode);

                if (valueObject != null) {
                    // Get the type of field
                    // If its an enum
                    if ("E".equals(itvVersionFieldDto.getType())) {
                        // Get the associated code
                        Object finalValueObject = valueObject;
                        ItvVersionEnumDto itvVersionEnumDto = itvVersionFieldDto.getListItvVersionEnum().stream().filter(e -> e.getLabel().equals(finalValueObject.toString())).findFirst().orElse(null);

                        // If its not found, set the value to Z (Autre)
                        if (itvVersionEnumDto == null) {
                            itvVersionEnumDto = itvVersionFieldDto.getListItvVersionEnum().stream().filter(e -> e.getLabel().equals("Autre")).findFirst().orElse(null);
                        }

                        if (itvVersionEnumDto == null) {
                            throw new FunctionalException("Code non trouvé pour la valeur " + valueObject.toString() + " pour le champ " + code + " pour l'équipement " + assetDto.getId());
                        }

                        valueObject = itvVersionEnumDto.getVal();
                    }
                }

                mapData.put(code, valueObject);
            }

            listBData.add(mapData);
        }

        // ### C ### //
        List<String> listCField = Arrays.asList("I","J","A","B","C","D","E","F","G","H","K","L","M","N");

        // ### TXT ### //
        if ("txt".equals(fileType)) {
            String itv = "";

            // ## HEADER ## //
            String fieldSeparator = ",";
            String decimalSeparator = ".";
            String textSurroundingChar = "\"";

            String header =
                    "#A1=ISO-8859-1\r\n" +
                    "#A2=fr\r\n" +
                    "#A3=" + fieldSeparator + "\r\n" +
                    "#A4=" + decimalSeparator + "\r\n" +
                    "#A5=" + textSurroundingChar + "\r\n" +
                    "#A6=GIMS GIMAP-4.19.9-CANOPE-4.19_2.21\r\n";

            itv += header;

            // ## Block ## //
            int nbBFieldByLine = 10;

            for (Map<String, Object> mapData : listBData) {
                // ## B ## //
                List<String> listCode = new ArrayList<>(mapData.keySet());
                listCode.sort(String::compareTo);
                int i = 1;
                for (int startIndex = 0; startIndex < listCode.size(); startIndex = startIndex + nbBFieldByLine) {
                    int endIndex = Math.min(startIndex + nbBFieldByLine, listCode.size());
                    List<String> listCodeSub = listCode.subList(startIndex, endIndex);

                    // # Header # //
                    itv += "#B" + String.format("%02d", i) + "=" + String.join(fieldSeparator, listCodeSub) + "\r\n";

                    // # Data # //
                    List<String> listValue = new ArrayList<>();
                    for (String code : listCodeSub) {
                        String value = "";

                        // Get the corresponding asset field code depending of the layer
                        Object valueObject = mapData.get(code);
                        if (valueObject != null) {
                            if (valueObject instanceof String) {
                                value = textSurroundingChar + (String) valueObject + textSurroundingChar;
                            } else if (valueObject instanceof Double || valueObject instanceof BigDecimal) {
                                value = valueObject.toString().replace(".", decimalSeparator);
                            } else {
                                value = valueObject.toString();
                            }
                        }

                        listValue.add(value);
                    }
                    itv += String.join(fieldSeparator, listValue) + "\r\n";

                    i++;
                }

                // ## C ## //
                String c = "#C=" + String.join(fieldSeparator, listCField) + "\r\n";

                // End Block
                String z = "#Z\r\n";

                itv += c + z;
            }

            // Delete the last \r\n
            itv = itv.substring(0, itv.length() - 2);

            ExportItvDto exportItvDto = new ExportItvDto();
            exportItvDto.setData(itv.getBytes(StandardCharsets.UTF_8));
            exportItvDto.setFilename("itv_" + sdf.format(new Date()) + ".txt");
            return exportItvDto;
        } else {
            // ### XML ### //
            Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
            Element rootElement = doc.createElement("DATA");
            doc.appendChild(rootElement);

            // ## Header ## //
            Element zaElement = doc.createElement("ZA");
            rootElement.appendChild(zaElement);

            // A2
            Element a2Element = doc.createElement("A2");
            a2Element.setTextContent("fr");
            zaElement.appendChild(a2Element);

            // A6
            Element a6Element = doc.createElement("A6");
            a6Element.setTextContent("GIMS GIMAP-4.19.9-CANOPE-4.19_2.21");
            zaElement.appendChild(a6Element);

            // ## Block ## //
            for (Map<String, Object> mapData : listBData) {
                Element zbElement = doc.createElement("ZB");
                rootElement.appendChild(zbElement);

                // # B # //
                List<String> listCode = new ArrayList<>(mapData.keySet());
                listCode.sort(String::compareTo);
                for (String code : listCode) {
                    Element bElement = doc.createElement(code);
                    bElement.setTextContent(mapData.get(code) != null ? mapData.get(code).toString() : null);
                    zbElement.appendChild(bElement);
                }

                // # C # //
                Element zcElement = doc.createElement("ZC");
                zbElement.appendChild(zcElement);

                for (String cField : listCField) {
                    Element cElement = doc.createElement(cField);
                    zcElement.appendChild(cElement);
                }
            }

            StringWriter sw = new StringWriter();
            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            transformer.setOutputProperty(OutputKeys.METHOD, "xml");
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

            transformer.transform(new DOMSource(doc), new StreamResult(sw));

            ExportItvDto exportItvDto = new ExportItvDto();
            exportItvDto.setData(sw.toString().getBytes());
            exportItvDto.setFilename("itv_" + sdf.format(new Date()) + ".xml");
            return exportItvDto;
        }
    }
}
