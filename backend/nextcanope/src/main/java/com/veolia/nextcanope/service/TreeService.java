package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.TreeDto;
import com.veolia.nextcanope.model.Tree;
import com.veolia.nextcanope.repository.TreeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TreeService {
    @Autowired
    TreeRepository treeRepository;

    public List<TreeDto> getTree(){
        List<Tree> trees = treeRepository.findAll();
        List<TreeDto> treeDtos =new ArrayList<TreeDto>();
        for(Tree tree :trees){
            treeDtos.add(new TreeDto(tree));
        }
        return  createTree(treeDtos);
    }

    private static List<TreeDto> createTree(List<TreeDto> treeDtos) {

        Map<Long, TreeDto> mapTmp = new HashMap<>();

        //Save all nodes to a map
        for (TreeDto current : treeDtos) {
            mapTmp.put(current.getId(), current);
        }

        //loop and assign parent/child relationships
        for (TreeDto current : treeDtos) {
            Long parentId = current.getParentId();
            if (parentId != null) {
                TreeDto parent = mapTmp.get(parentId);
                if (parent != null) {
                    //current.setParent(parent);
                    parent.addChild(current);
                    //mapTmp.put(parentId, parent);
                    mapTmp.put(current.getId(), current);
                }
            }
        }


        //get the roots
        List<TreeDto> roots = new ArrayList<TreeDto>();
        for (TreeDto treeDto : mapTmp.values()) {
            if(treeDto.getParentId() == null) {
                roots.add(treeDto);
            }
        }
        return roots;

    }
}
