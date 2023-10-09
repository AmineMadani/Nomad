package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.ReportQuestionDto;
import com.veolia.nextcanope.model.ReportQuestion;
import com.veolia.nextcanope.repository.ReportQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ReportQuestionService {
    @Autowired
    ReportQuestionRepository reportQuestionRepository;

    public List<ReportQuestionDto> getListReportQuestion() {
        List<ReportQuestion> listReportQuestion = reportQuestionRepository.findAll();
        return listReportQuestion.stream()
                .sorted(Comparator.comparing(ReportQuestion::getRqnLlabel))
                .map(ReportQuestionDto::new)
                .toList();
    }
}
