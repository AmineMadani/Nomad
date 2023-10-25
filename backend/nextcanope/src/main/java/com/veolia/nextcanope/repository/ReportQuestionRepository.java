package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.configuration.NomadRepository;
import com.veolia.nextcanope.model.ReportQuestion;
import org.springframework.data.jpa.repository.Query;

public interface ReportQuestionRepository extends NomadRepository<ReportQuestion, Long> {

    @Query(value="select nextval('nomad.report_question_rqn_code')", nativeQuery = true)
    Long getNextRqnCodeSequenceValue();
}
