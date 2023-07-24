package com.veolia.nomad.batch.workordermoveobatch.batch;

import java.net.URI;
import java.net.URISyntaxException;

import javax.sql.DataSource;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.support.SqlPagingQueryProviderFactoryBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.transaction.PlatformTransactionManager;

import com.veolia.nomad.batch.workordermoveobatch.model.MoveoOrdreIntervention;
import com.veolia.nomad.batch.workordermoveobatch.model.WorkOrder;
import com.veolia.nomad.batch.workordermoveobatch.process.JobCompletionNotificationListener;
import com.veolia.nomad.batch.workordermoveobatch.process.WorkorderItemProcessor;
import com.veolia.nomad.batch.workordermoveobatch.utils.NomadApiGatewayCaller;

@Configuration
public class BatchConfiguration {
	
	@Value("${com.veolia.nomad.moveo.api.region}")
    String moveoApiRegion;
    
    @Value("${com.veolia.nomad.moveo.api.url}")
    String moveoApiUrl;

    @Value("${com.veolia.nomad.moveo.api.accesskey}")
    String moveoApiAccessKey;
    
    @Value("${com.veolia.nomad.moveo.api.secretkey}")
    String moveoApiSecretKey;

	/**
     * Reader method to get all workorders to synchronized
     */
    @Bean
    ItemReader<WorkOrder> reader(DataSource dataSource) throws Exception {
        final SqlPagingQueryProviderFactoryBean sqlPagingQueryProviderFactoryBean = new SqlPagingQueryProviderFactoryBean();
        
        
        sqlPagingQueryProviderFactoryBean.setDataSource(dataSource);
        sqlPagingQueryProviderFactoryBean.setSelectClause(
                "select "
                + "	case "
                + "		when wts.wts_code = 'ANNULE' then 'S' "
                + "		else null "
                + "	end as codeMvt, "
                + "	'NOMAD' as origin, "
                + "	case "
                + "		when t.nbTsk > 1 then '38' "
                + "		else ast.ast_code end as type, "
                + "	wtr.wtr_code as reason, "
                + "	wts.wts_code as status, "
                + "	w.wko_address as street, "
                + "	null as postalCode, "
                + "	cty.cty_llabel as city, "
                + "	w.id as id, "
                + "	w.wko_planning_start_date as planningStartDate, "
                + "	w.wko_planning_end_date as planningEndDate, "
                + "	60 as duration, "
                + "	w.wko_creation_comment as creationComment, "
                + "	w.wko_appointment as appointment, "
                + "	w.wko_emergency as emergency, "
                + "	cty.cty_code as inseeCode, "
                + "	ctr.ctr_code as contractCode, "
                + "	null as worksiteCode, "
                + "	w.wko_name as name, "
                + "	replace(ass.ass_obj_table, 'asset.', '') as lyrTableName, "
                + "	ass.ass_obj_ref as assetId, "
                + "	w.latitude, "
                + "	w.longitude, "
                + "	w.wko_agent_nb as nbAgent, "
                + "	t.nbTsk as nbTsk"
                
        );
        sqlPagingQueryProviderFactoryBean.setFromClause(
                " from "
                + "	nomad.workorder w "
                + "inner join  "
                + "	(select t.*, tb.nbTsk  from nomad.task t "
                + "	inner join (select wko_id, count(wko_id) as nbTsk from nomad.task group by wko_id) tb on tb.wko_id=t.wko_id "
                + "	where t.id in (select max(id) from nomad.task group by wko_id)) as t on t.wko_id=w.id "
                + "inner join nomad.asset ass on "
                + "	ass.id = t.ass_id "
                + "inner join nomad.layer l on "
                + "	l.lyr_table_name = ass.ass_obj_table "
                + "inner join nomad.asset_type ast on "
                + "	ast.id = l.ast_id "
                + "inner join nomad.workorder_task_reason wtr on "
                + "	wtr.id = t.wtr_id "
                + "inner join nomad.city cty on "
                + "	cty.id = w.cty_id "
                + "inner join nomad.contract ctr on "
                + "	ctr.id = t.ctr_id "
                + "inner join nomad.workorder_task_status wts on "
                + "	wts.id = w.wts_id "
        );
        sqlPagingQueryProviderFactoryBean.setWhereClause(
                " where "
                + "	w.wko_ext_to_sync is true "
        );
        
        sqlPagingQueryProviderFactoryBean.setSortKey("id");

        
        JdbcPagingItemReader<WorkOrder> reader = new JdbcPagingItemReader<>();
        reader.setDataSource(dataSource);
        reader.setPageSize(10000);
        reader.setQueryProvider(sqlPagingQueryProviderFactoryBean.getObject());
        reader.setRowMapper(new BeanPropertyRowMapper<>(WorkOrder.class));
        reader.setSaveState(false);
        reader.afterPropertiesSet();

        return reader;
    }

	@Bean
	public WorkorderItemProcessor processor() {
		return new WorkorderItemProcessor();
	}
	
    @Bean
    public BatchWriter writer(DataSource dataSource) throws URISyntaxException {
    	
    	NomadApiGatewayCaller caller = new NomadApiGatewayCaller(
                moveoApiAccessKey,
                moveoApiSecretKey,
                null,
                moveoApiRegion,
                new URI(moveoApiUrl)
        );
    	
        return new BatchWriter(dataSource, caller);
    }

	@Bean
	public Job syncWorkorderJob(JobRepository jobRepository,
			JobCompletionNotificationListener listener, Step step1) {
		return new JobBuilder("syncWorkorderJob", jobRepository)
			.incrementer(new RunIdIncrementer())
			.listener(listener)
			.flow(step1)
			.end()
			.build();
	}

	@Bean
	public Step step1(JobRepository jobRepository, DataSource dataSource,
			PlatformTransactionManager transactionManager) throws Exception {
		return new StepBuilder("step1", jobRepository)
			.<WorkOrder, MoveoOrdreIntervention> chunk(50, transactionManager)
			.reader(reader(dataSource))
			.processor(processor())
			.writer(writer(dataSource))
			.build();
	}
}