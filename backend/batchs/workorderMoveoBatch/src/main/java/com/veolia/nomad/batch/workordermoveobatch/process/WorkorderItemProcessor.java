package com.veolia.nomad.batch.workordermoveobatch.process;

import org.springframework.batch.item.ItemProcessor;

import com.veolia.nomad.batch.workordermoveobatch.model.MoveoOrdreIntervention;
import com.veolia.nomad.batch.workordermoveobatch.model.WorkOrder;

public class WorkorderItemProcessor implements ItemProcessor<WorkOrder, MoveoOrdreIntervention> {

	@Override
	public MoveoOrdreIntervention process(final WorkOrder workorder) throws Exception {
		return new MoveoOrdreIntervention(workorder);
	}

}
