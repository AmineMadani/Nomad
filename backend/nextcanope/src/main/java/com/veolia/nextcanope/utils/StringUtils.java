package com.veolia.nextcanope.utils;

import java.util.List;
import java.util.stream.Collectors;

public class StringUtils {
    public static String javaListToPostgresList(List<?> list) {
        return list.stream().map(Object::toString).collect(Collectors.joining(","));
    }
}
