package com.veolia.nextcanope.dto.payload;

public class CancelWorkorderPayload {

    private Long id;

    private String cancelComment;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCancelComment() {
        return cancelComment;
    }

    public void setCancelComment(String cancelComment) {
        this.cancelComment = cancelComment;
    }

	public CancelWorkorderPayload(Long id, String cancelComment) {
        super();
        this.id = id;
        this.cancelComment = cancelComment;
    }
}
