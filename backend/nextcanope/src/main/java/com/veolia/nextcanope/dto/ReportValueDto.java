package com.veolia.nextcanope.dto;

public class ReportValueDto {

	private String key;
	
	private String question;
	
	private String answer;

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}

	public ReportValueDto() {
		super();
	}
}
