package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.itv.ITVBlockDto;
import com.veolia.nextcanope.dto.itv.ItvVersionDto;
import com.veolia.nextcanope.dto.itv.ItvVersionEnumDto;
import com.veolia.nextcanope.dto.itv.ItvVersionFieldDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.model.ItvVersion;
import com.veolia.nextcanope.model.ItvVersionAlias;
import com.veolia.nextcanope.repository.ItvVersionAliasRepository;
import com.veolia.nextcanope.repository.ItvVersionEnumRepository;
import com.veolia.nextcanope.repository.ItvVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd");
    SimpleDateFormat sdfHour = new SimpleDateFormat("HH:mm");

    public void readFile(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename();
        String extension = name.substring(name.lastIndexOf(".") + 1);

        if ("txt".equals(extension.toLowerCase())) {
            readTxtFile(file);
        } else if ("xml".equals(extension.toLowerCase())) {
            readXmlFile(file);
        } else {
            throw new FunctionalException("Le type de fichier n'est pas géré dans l'intégration.");
        }
    }

    public void readTxtFile(MultipartFile file) throws IOException {
        String content = new String(file.getBytes());

        // Get referential data
        List<ItvVersionAlias> listItvVersionAlias = itvVersionAliasRepository.findAll();
        List<ItvVersionDto> listItvVersion = getListItvVersion();

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

        List<ITVBlockDto> listItvBlockDto = new ArrayList<>();
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

        // Check that a all header fields are present only once
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
        for (int i = 0; i < listLine.size() ; i++) {
            String line = listLine.get(i).trim();

            if (line.startsWith("#A") || line.startsWith("#Z")) continue;

            if (line.startsWith("#B") || line.startsWith("#C") ) {
                // Its the start of a block
                // Search the end of it
                Integer endIndex = getNextIndexOfValue(listLine, i + 1, false, false, true);

                if (endIndex == null) {
                    ITVBlockDto itvBlockDto = new ITVBlockDto();
                    itvBlockDto.setError("ERREUR dans le bloc débutant en ligne " + i + ". " + "Le block ne se fini pas.");
                    listItvBlockDto.add(itvBlockDto);
                    break;
                }

                // Get the list of line composing the block
                List<String> listLineBlock = listLine.subList(i, endIndex + 1);

                // Read the block
                ITVBlockDto itvBlockDto;
                try {
                    itvBlockDto = readBlock(listLineBlock, fieldSeparator, textSurroundingChar);
                } catch (Exception e) {
                    itvBlockDto = new ITVBlockDto();
                    itvBlockDto.setError("ERREUR dans le bloc débutant en ligne " + i + ". " + e.getMessage());
                }

                if (itvBlockDto.getError() == null) {
                    // Check the validity of the datas
                    try {
                        checkValidityBlock(itvBlockDto, listItvVersionAlias, listItvVersion, decimalSeparator);
                    } catch (Exception e) {
                        itvBlockDto.setError("ERREUR dans le bloc débutant en ligne " + i + ". " + e.getMessage());
                    }
                }

                listItvBlockDto.add(itvBlockDto);

                // Go the next block
                i = endIndex;
            } else {
                throw new FunctionalException("Le fichier contient l'identifiant " + line.substring(0, 2) + " qui n'est pas prévu par les versions de la norme gérées par l'application.");
            }
        }
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
    private ITVBlockDto readBlock(List<String> listLine, String fieldSeparator, String textSurroundingChar) {
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

        return new ITVBlockDto(mapB, listMapC);
    }

    /**
     * Check the validity of the block
     * @param itvBlockDto A dto containing the map of value for B, and a list of values for C
     * @param listItvVersionAlias List of correspondence version alias <> version
     * @param listItvVersion List of ITV fields definition by version
     */
    private void checkValidityBlock(
            ITVBlockDto itvBlockDto, List<ItvVersionAlias> listItvVersionAlias, List<ItvVersionDto> listItvVersion,
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

    public void readXmlFile(MultipartFile file) {

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
}
