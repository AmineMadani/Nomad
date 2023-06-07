package com.veolia.nomad.batch.workordermoveobatch.batch;

import javax.sql.DataSource;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.JdbcPagingItemReader;
import org.springframework.batch.item.database.support.SqlPagingQueryProviderFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.transaction.PlatformTransactionManager;

import com.veolia.nomad.batch.workordermoveobatch.model.WorkOrder;
import com.veolia.nomad.batch.workordermoveobatch.process.BatchWriter;
import com.veolia.nomad.batch.workordermoveobatch.process.JobCompletionNotificationListener;
import com.veolia.nomad.batch.workordermoveobatch.process.PersonItemProcessor;

@Configuration
public class BatchConfiguration {

	/**
     * Méthode reader qui récupère les communes à ajouter.
     */
    @Bean
    ItemReader<WorkOrder> reader(DataSource dataSource) throws Exception {
        final SqlPagingQueryProviderFactoryBean sqlPagingQueryProviderFactoryBean = new SqlPagingQueryProviderFactoryBean();
        
        
        sqlPagingQueryProviderFactoryBean.setDataSource(dataSource);
        sqlPagingQueryProviderFactoryBean.setSelectClause(
                "SELECT "
                + "	lyr_table_name "
        );
        sqlPagingQueryProviderFactoryBean.setFromClause(
                " FROM nomad.layer "
        );
        sqlPagingQueryProviderFactoryBean.setWhereClause(
                " where "
                + "	lyr_valid = true "
        );
        
        sqlPagingQueryProviderFactoryBean.setSortKey("lyr_table_name");

        
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
	public PersonItemProcessor processor() {
		return new PersonItemProcessor();
	}
	
    @Bean
    public BatchWriter writer(DataSource dataSource) {
        return new BatchWriter(dataSource);
    }

	@Bean
	public Job importUserJob(JobRepository jobRepository,
			JobCompletionNotificationListener listener, Step step1) {
		return new JobBuilder("importUserJob", jobRepository)
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
			.<WorkOrder, WorkOrder> chunk(10, transactionManager)
			.reader(reader(dataSource))
			.processor(processor())
			.writer(writer(dataSource))
			.build();
	}
}