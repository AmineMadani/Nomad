package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.ReportQuestionDto;
import com.veolia.nextcanope.dto.reportQuestion.ReportQuestionUpdateDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.ReportQuestion;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.ReportQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ReportQuestionService {
    @Autowired
    ReportQuestionRepository reportQuestionRepository;

    @Autowired
    UserService userService;

    public List<ReportQuestionDto> getListReportQuestion() {
        List<ReportQuestion> listReportQuestion = reportQuestionRepository.findAll();
        return listReportQuestion.stream()
                .sorted(Comparator.comparing(ReportQuestion::getRqnLlabel))
                .map(ReportQuestionDto::new)
                .toList();
    }

    public ReportQuestionDto getReportQuestionById(Long id) {
        ReportQuestion reportQuestion = reportQuestionRepository.findById(id).orElseThrow(() -> new FunctionalException("La question avec l'id " + id + " n'existe pas."));
        return new ReportQuestionDto(reportQuestion);
    }

    /**
     * Create a report question
     * @param reportQuestionUpdateDto The report question to create
     * @param userId the user id who create the report question
     * @return The report question
     */
    public Long createReportQuestion(ReportQuestionUpdateDto reportQuestionUpdateDto, Long userId) {
        Users user = userService.getUserById(userId);

        ReportQuestion reportQuestion = new ReportQuestion();
        reportQuestion.setRqnCode("UUID-" + reportQuestionRepository.getNextRqnCodeSequenceValue());
        reportQuestion.setRqnSlabel(reportQuestionUpdateDto.getRqnSlabel());
        reportQuestion.setRqnLlabel(reportQuestionUpdateDto.getRqnLlabel());
        reportQuestion.setRqnType(reportQuestionUpdateDto.getRqnType());
        reportQuestion.setRqnRequired(reportQuestionUpdateDto.getRqnRequired());
        reportQuestion.setRqnSelectValues(reportQuestionUpdateDto.getRqnSelectValues());
        reportQuestion.setCreatedBy(user);
        reportQuestion.setModifiedBy(user);

        try {
            reportQuestion = reportQuestionRepository.save(reportQuestion);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde de la question pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
        }

        return reportQuestion.getId();
    }

    /**
     * Update a report question
     * @param reportQuestionUpdateDto The report question to create
     * @param userId the user id who update the report question
     * @return The report question
     */
    public Long updateReportQuestion(ReportQuestionUpdateDto reportQuestionUpdateDto, Long userId) {
        Users user = userService.getUserById(userId);

        ReportQuestion reportQuestion = reportQuestionRepository.findById(reportQuestionUpdateDto.getId()).orElse(null);
        if (reportQuestion == null)
            throw new FunctionalException("Question non trouvée : " + reportQuestionUpdateDto.getId());
        
        reportQuestion.setRqnSlabel(reportQuestionUpdateDto.getRqnSlabel());
        reportQuestion.setRqnLlabel(reportQuestionUpdateDto.getRqnLlabel());
        reportQuestion.setRqnType(reportQuestionUpdateDto.getRqnType());
        reportQuestion.setRqnRequired(reportQuestionUpdateDto.getRqnRequired());
        reportQuestion.setRqnSelectValues(reportQuestionUpdateDto.getRqnSelectValues());
        reportQuestion.setModifiedBy(user);

        try {
            reportQuestion = reportQuestionRepository.save(reportQuestion);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde de la question pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
        }

        return reportQuestion.getId();
    }

    /**
     * Delete a report question
     * @param listId The list of id of the report question to delete
     */
    public void deleteListReportQuestion(List<Long> listId, Long userId) {
        Users user = userService.getUserById(userId);

        List<ReportQuestion> listReportQuestionToDelete = new ArrayList<>();
        for (Long id : listId) {
            ReportQuestion reportQuestion = reportQuestionRepository.findById(id).orElse(null);
            if (reportQuestion == null)
                throw new FunctionalException("Question non trouvée : " + id);

            reportQuestion.markAsDeleted(user);
            listReportQuestionToDelete.add(reportQuestion);
        }
        try {
            reportQuestionRepository.saveAll(listReportQuestionToDelete);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la suppression de(s) la question(s)");
        }
    }
}
