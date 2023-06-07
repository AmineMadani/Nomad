package com.veolia.nomad.batch.workordermoveobatch.process;

import org.springframework.batch.item.ItemProcessor;
import com.veolia.nomad.batch.workordermoveobatch.model.WorkOrder;

public class PersonItemProcessor implements ItemProcessor<WorkOrder, WorkOrder> {

	@Override
	public WorkOrder process(final WorkOrder person) throws Exception {
		final String tableName = person.getLyrTableName();

		final WorkOrder transformedPerson = new WorkOrder(tableName);

		return transformedPerson;
	}

}
