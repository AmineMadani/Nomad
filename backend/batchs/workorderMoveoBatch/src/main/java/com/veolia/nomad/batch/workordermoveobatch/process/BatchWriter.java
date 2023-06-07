package com.veolia.nomad.batch.workordermoveobatch.process;

import java.util.Date;

import javax.sql.DataSource;

import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.jdbc.core.JdbcTemplate;

import com.veolia.nomad.batch.workordermoveobatch.model.WorkOrder;

public class BatchWriter implements ItemWriter<WorkOrder> {
	
	private final JdbcTemplate jdbcTemplate;

    public BatchWriter(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

	@Override
	public void write(Chunk<? extends WorkOrder> chunk) throws Exception {
		System.out.println(chunk);
	}

}
