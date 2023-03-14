import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { TreeData } from 'src/app/core/models/filter/filter-component-models/TreeFilter.model';

@Component({
  selector: 'app-filter-tree',
  templateUrl: './filter-tree.component.html',
  styleUrls: ['./filter-tree.component.scss'],
})
export class FilterTreeComponent implements OnInit {

  constructor() { 
    this.selectedNodes = new Set<TreeData>();
    this.dataSource = new MatTreeNestedDataSource<TreeData>();
    this.treeControl = new NestedTreeControl<TreeData>(
      (node: TreeData) => node.children
    );
  }

  @Input() data: TreeData[];
  
  dataSource: MatTreeNestedDataSource<TreeData>;
  treeControl: NestedTreeControl<TreeData>;
  selectedNodes: Set<TreeData>;

  ngOnInit() {
    this.dataSource.data = this.data;
  }

  hasChild = (_: number, node: TreeData): boolean =>
    !!node.children && node.children.length > 0;

  descendantsAllSelected(node: TreeData): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every((child: TreeData) =>
      this.selectedNodes.has(child)
    );
  }

  descendantsPartiallySelected(node: TreeData): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child: TreeData) =>
      this.selectedNodes.has(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  /**
   * If the node is partially selected, and the selectedNodes set contains the node, then remove the node
   * from the set. Otherwise, add of remove node from Set depending on checkbox value.
   * Then, for each descendant of the node, if the Set contains the node
   * add the descendant to the set, otherwise remove the descendant from the set.
   * @param {Event} e - Event - the event that triggered the checkbox change
   * @param {TreeData} node - Accordeon - this is the node that was clicked on.
   */
  onCheckboxChange(e: Event, node: TreeData): void {
    setTimeout(() => { 
      if (
        this.descendantsPartiallySelected(node) &&
        this.selectedNodes.has(node)
      ) {
        this.selectedNodes.delete(node);
        node.value=false;
      } else {
        (e as CustomEvent).detail.checked
          ? this.changeNode(node,true)
          : this.changeNode(node,false);
        const descendants = this.treeControl.getDescendants(node);
        descendants.forEach((desc: TreeData) => {
          this.selectedNodes.has(node)
            ? this.changeNode(desc,true)
            : this.changeNode(desc,false);
        });
      }
    })
  }


  changeNode(node: TreeData, checked: boolean) {
    if(checked) {
      this.selectedNodes.add(node);
    } else {
      this.selectedNodes.delete(node);
    }
    node.value=checked;
  }

}
