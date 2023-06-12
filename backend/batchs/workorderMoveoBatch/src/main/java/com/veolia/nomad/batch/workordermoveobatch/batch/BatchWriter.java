package com.veolia.nomad.batch.workordermoveobatch.batch;

import java.io.ByteArrayInputStream;

import javax.sql.DataSource;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.jdbc.core.JdbcTemplate;

import com.amazonaws.http.HttpMethodName;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.veolia.nomad.batch.workordermoveobatch.model.MoveoOrdreIntervention;
import com.veolia.nomad.batch.workordermoveobatch.utils.NomadApiGatewayCaller;
import com.veolia.nomad.batch.workordermoveobatch.utils.NomadApiGatewayException;
import com.veolia.nomad.batch.workordermoveobatch.utils.NomadApiGatewayResponse;

public class BatchWriter implements ItemWriter<MoveoOrdreIntervention> {

	private static final Logger log = LoggerFactory.getLogger(BatchWriter.class);

	private final JdbcTemplate jdbcTemplate;

	private final NomadApiGatewayCaller caller;

	public BatchWriter(DataSource dataSource, NomadApiGatewayCaller caller) {
		this.jdbcTemplate = new JdbcTemplate(dataSource);
		this.caller = caller;
	}

	@Override
	public void write(Chunk<? extends MoveoOrdreIntervention> chunk) throws Exception {
		for (MoveoOrdreIntervention item : chunk) {
			log.info("Started synchronization for the workorder " + item.getId());
			sendWorkorder(item);
			log.info("End synchronization for the workorder " + item.getId());
		}
	}

	/**
	 * Synchronized workorder with moveo
	 * @param oi workorder
	 */
	private void sendWorkorder(MoveoOrdreIntervention oi) {
		Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").create();
		NomadApiGatewayResponse response = null;
		String error = null;

		try {
			response = caller.execute(HttpMethodName.POST, "",
					new ByteArrayInputStream(gson.toJson(oi).toString().getBytes()));
		} catch (NomadApiGatewayException e) {
			try {
				JSONObject result = new JSONObject(e.getErrorMessage());
				error = (String) result.get("body");
				log.error(error);
			} catch (Exception ex) {
				error = ex.getMessage();
				log.error(error);
			}
		} catch (Exception e) {
			error = e.getMessage();
			log.error(error);
		}

		String intNumero = null;
		if (response != null && response.getHttpResponse().getStatusCode() == 200) {
			intNumero = StringUtils.substringBetween(response.getBody(), "b'", "'");
		} else {
			if (response != null) {
				error = response.getBody();
			}
		}

		boolean toSync = intNumero != null ? false : true;
		
		String statusUpdate = "";
		if(oi.getWkoStatus().equals("CREE")) {
			statusUpdate =", wts_id=(select id from nomad.workorder_task_status wts where wts_code='ENVOYEPLANIF')";
		}

		log.info("Update the workorder " + oi.getId());
		jdbcTemplate.update("UPDATE nomad.workorder "
				+ "SET wko_ext_date_sync=CURRENT_TIMESTAMP, wko_ext_to_sync=?, wko_ext_ref=?, wko_ext_error=?"+statusUpdate+" "
				+ "WHERE id=?", toSync, intNumero, error, oi.getId());
	}

}
