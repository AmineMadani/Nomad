package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.NodeDto;
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

    public List<NodeDto> getTree(){
        List<Tree> trees = treeRepository.findAll();
        List<NodeDto> nodeDtos =new ArrayList<NodeDto>();
        for(Tree tree :trees){
            nodeDtos.add(new NodeDto(tree));
        }
        return  createTree(nodeDtos);
    }

    private static List<NodeDto> createTree(List<NodeDto> nodeDtos) {

        Map<Long, NodeDto> mapTmp = new HashMap<>();

        //Save all nodes to a map
        for (NodeDto current : nodeDtos) {
            mapTmp.put(current.getId(), current);
        }

        //loop and assign parent/child relationships
        for (NodeDto current : nodeDtos) {
            Long parentId = current.getParentId();
            if (parentId != null) {
                NodeDto parent = mapTmp.get(parentId);
                if (parent != null) {
                    //current.setParent(parent);
                    parent.addChild(current);
                    //mapTmp.put(parentId, parent);
                    mapTmp.put(current.getId(), current);
                }
            }
        }


        //get the roots
        List<NodeDto> roots = new ArrayList<NodeDto>();
        for (NodeDto nodeDto : mapTmp.values()) {
            if(nodeDto.getParentId() == null) {
                roots.add(nodeDto);
            }
        }
        return roots;

    }
}
