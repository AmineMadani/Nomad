package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.workorderTaskReason.WorkorderTaskReasonUpdateDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.AssetType;
import com.veolia.nextcanope.model.AstWtr;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.model.WorkorderTaskReason;
import com.veolia.nextcanope.repository.AssetTypeRepository;
import com.veolia.nextcanope.repository.WorkOrderTaskReasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkorderTaskReasonService {

    @Autowired
    UserService userService;

    @Autowired
    WorkOrderTaskReasonRepository workOrderTaskReasonRepository;

    @Autowired
    AssetTypeRepository assetTypeRepository;

    /**
     * Create a workorder task reason
     * @param workorderTaskReasonUpdateDto The workorder task reason to create
     * @param userId the user id who create the workorder task reason
     * @return The workorder task reason id
     */
    public Long createWorkorderTaskReason(WorkorderTaskReasonUpdateDto workorderTaskReasonUpdateDto, Long userId) {
        Users user = userService.getUserById(userId);

        WorkorderTaskReason wtr = new WorkorderTaskReason();
        wtr.setWtrCode(workorderTaskReasonUpdateDto.getWtrCode());
        wtr.setWtrSlabel(workorderTaskReasonUpdateDto.getWtrSlabel());
        wtr.setWtrLlabel(workorderTaskReasonUpdateDto.getWtrLlabel());
        wtr.setWtrNoXy(workorderTaskReasonUpdateDto.isWtrNoXy());
        wtr.setWtrWorkRequest(true);
        wtr.setWtrReport(true);
        wtr.setWtrWo(true);
        wtr.setWtrTask(true);
        wtr.setWtrValid(true);

        List<AstWtr> listAstWtr = new ArrayList<>();
        for (Long astId : workorderTaskReasonUpdateDto.getListAstId()) {
            AssetType assetType = assetTypeRepository.findById(astId).orElse(null);
            if (assetType == null)
                throw new FunctionalException("Type non trouvé : " + astId);

            AstWtr astWtr = new AstWtr();
            astWtr.setAssetType(assetType);
            astWtr.setAswValid(true);
            astWtr.setCreatedBy(user);
            astWtr.setModifiedBy(user);
            astWtr.setWorkorderTaskReason(wtr);
            listAstWtr.add(astWtr);
        }
        wtr.setListOfAstWtr(listAstWtr);

        wtr.setCreatedBy(user);
        wtr.setModifiedBy(user);

        try {
            wtr = workOrderTaskReasonRepository.save(wtr);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde du motif pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
        }

        return wtr.getId();
    }

    /**
     * Update a workorder task reason
     * @param workorderTaskReasonUpdateDto The workorder task reason to update
     * @param userId the user id who update the workorder task reason
     * @return The workorder task reason id
     */
    public Long updateWorkorderTaskReason(WorkorderTaskReasonUpdateDto workorderTaskReasonUpdateDto, Long userId) {
        Users user = userService.getUserById(userId);

        WorkorderTaskReason wtr = workOrderTaskReasonRepository.findById(workorderTaskReasonUpdateDto.getId()).orElse(null);
        if (wtr == null)
            throw new FunctionalException("Le motif avec l'id " + workorderTaskReasonUpdateDto.getId() + " n'existe pas.");

        wtr.setWtrSlabel(workorderTaskReasonUpdateDto.getWtrSlabel());
        wtr.setWtrLlabel(workorderTaskReasonUpdateDto.getWtrLlabel());
        wtr.setWtrNoXy(workorderTaskReasonUpdateDto.isWtrNoXy());
        wtr.setModifiedBy(user);

        // Add
        for (Long astId : workorderTaskReasonUpdateDto.getListAstId()) {
            // Check if the asset type is already linked to this wtr
            AstWtr astWtr = wtr.getListOfAstWtr().stream().filter(a -> a.getAssetType().getId().equals(astId)).findFirst().orElse(null);

            // If not, create it
            if (astWtr == null) {
                AssetType assetType = assetTypeRepository.findById(astId).orElse(null);
                if (assetType == null)
                    throw new FunctionalException("Type non trouvé : " + astId);

                astWtr = new AstWtr();
                astWtr.setAssetType(assetType);
                astWtr.setAswValid(true);
                astWtr.setCreatedBy(user);
                astWtr.setModifiedBy(user);
                astWtr.setWorkorderTaskReason(wtr);
                wtr.getListOfAstWtr().add(astWtr);
            }
        }

        // Delete
        List<AstWtr> listAstWtrToDelete = new ArrayList<>();
        for (AstWtr astWtr : wtr.getListOfAstWtr()) {
            if (!workorderTaskReasonUpdateDto.getListAstId().contains(astWtr.getAssetType().getId())) {
                listAstWtrToDelete.add(astWtr);
            }
        }

        if (listAstWtrToDelete.size() > 0) {
            wtr.getListOfAstWtr().removeAll(listAstWtrToDelete);
        }

        try {
            wtr = workOrderTaskReasonRepository.save(wtr);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde du motif pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
        }

        return wtr.getId();
    }
}
