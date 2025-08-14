package com.example.tech.entity;

public final class StepNumber {
    private StepNumber() {}
    public static int[] parse(String raw) {
        if (raw == null) return new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE};
        String norm = raw.replaceAll("[‐–—−－]", "-")
                .replaceAll("\\s+", "").trim();
        var m = norm.matches("\\d+-\\d+") ? norm.split("-") : null;
        if (m == null) return new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE};
        try {
            return new int[]{ Integer.parseInt(m[0]), Integer.parseInt(m[1]) };
        } catch (NumberFormatException e) {
            return new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE};
        }
    }
}

