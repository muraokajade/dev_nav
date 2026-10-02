package com.example.tech.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 公開APIで返すDTOがメールアドレスをJSONに出さないことを確認する。
 * Spring Context / DB / Firebase は起動しない。
 */
class PublicDtoSerializationTest {

    private static final String EMAIL = "author@example.com";
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 1, 1, 0, 0);

    // 本番と同じ Spring の Jackson 設定（JavaTimeModule 等）で変換する
    private final ObjectMapper mapper = Jackson2ObjectMapperBuilder.json().build();

    @Test
    void articleDtoDoesNotExposeUserEmail() throws Exception {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(1L);
        dto.setSlug("article-slug");
        dto.setTitle("Article title");
        dto.setUserEmail(EMAIL);
        dto.setAuthorName("Author");
        dto.setCategory("Spring");
        dto.setSummary("summary");
        dto.setContent("content");
        dto.setImageUrl("/uploads/a.png");
        dto.setCreatedAt(NOW);
        dto.setUpdatedAt(NOW);
        dto.setPublished(true);

        JsonNode json = mapper.readTree(mapper.writeValueAsString(dto));

        assertThat(json.has("userEmail")).isFalse();
        assertThat(json.toString()).doesNotContain(EMAIL);
        assertThat(json.get("title").asText()).isEqualTo("Article title");
        assertThat(json.get("authorName").asText()).isEqualTo("Author");
        assertThat(json.get("slug").asText()).isEqualTo("article-slug");
        assertThat(json.get("category").asText()).isEqualTo("Spring");
        assertThat(json.has("createdAt")).isTrue();
        assertThat(json.get("published").asBoolean()).isTrue();
    }

    @Test
    void syntaxDtoDoesNotExposeUserEmail() throws Exception {
        SyntaxDTO dto = new SyntaxDTO();
        dto.setId(2L);
        dto.setSlug("syntax-slug");
        dto.setTitle("Syntax title");
        dto.setUserEmail(EMAIL);
        dto.setDisplayName("Display");
        dto.setAuthorName("Author");
        dto.setCategory("React");
        dto.setSummary("summary");
        dto.setContent("content");
        dto.setCreatedAt(NOW);
        dto.setUpdatedAt(NOW);
        dto.setPublished(true);

        JsonNode json = mapper.readTree(mapper.writeValueAsString(dto));

        assertThat(json.has("userEmail")).isFalse();
        assertThat(json.toString()).doesNotContain(EMAIL);
        assertThat(json.get("title").asText()).isEqualTo("Syntax title");
        assertThat(json.get("authorName").asText()).isEqualTo("Author");
        assertThat(json.get("displayName").asText()).isEqualTo("Display");
        assertThat(json.get("slug").asText()).isEqualTo("syntax-slug");
        assertThat(json.has("createdAt")).isTrue();
    }

    @Test
    void procedureDtoDoesNotExposeUserEmail() throws Exception {
        ProcedureDTO dto = new ProcedureDTO();
        dto.setId(3L);
        dto.setStepNumber("1-01");
        dto.setSlug("procedure-slug");
        dto.setTitle("Procedure title");
        dto.setUserEmail(EMAIL);
        dto.setAuthorName("Author");
        dto.setCategory("Setup");
        dto.setContent("content");
        dto.setImageUrl("/uploads/p.png");
        dto.setPublished(true);
        dto.setCreatedAt(NOW);
        dto.setUpdatedAt(NOW);

        JsonNode json = mapper.readTree(mapper.writeValueAsString(dto));

        assertThat(json.has("userEmail")).isFalse();
        assertThat(json.toString()).doesNotContain(EMAIL);
        assertThat(json.get("title").asText()).isEqualTo("Procedure title");
        assertThat(json.get("authorName").asText()).isEqualTo("Author");
        assertThat(json.get("stepNumber").asText()).isEqualTo("1-01");
        assertThat(json.get("slug").asText()).isEqualTo("procedure-slug");
        assertThat(json.has("createdAt")).isTrue();
    }
}
