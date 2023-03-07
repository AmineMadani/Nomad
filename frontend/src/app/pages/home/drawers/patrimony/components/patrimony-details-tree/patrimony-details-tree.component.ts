import { Component, OnInit, Input } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeNestedDataSource } from '@angular/material/tree';
import { AccordeonData } from '../../patrimony-dataset';

@Component({
  selector: 'app-patrimony-details-tree',
  templateUrl: './patrimony-details-tree.component.html',
  styleUrls: ['./patrimony-details-tree.component.scss'],
})
export class PatrimonyDetailsTreeComponent implements OnInit {
  constructor() {
    this.selectedNodes = new Set<AccordeonData>();
    this.dataSource = new MatTreeNestedDataSource<AccordeonData>();
    this.treeControl = new NestedTreeControl<AccordeonData>(
      (node: AccordeonData) => node.children
    );
  }

  @Input() treeData: AccordeonData[];
  dataSource: MatTreeNestedDataSource<AccordeonData>;
  treeControl: NestedTreeControl<AccordeonData>;
  selectedNodes: Set<AccordeonData>;

  ngOnInit() {
    this.dataSource.data = this.treeData;
  }

  hasChild = (_: number, node: AccordeonData): boolean =>
    !!node.children && node.children.length > 0;

  descendantsAllSelected(node: AccordeonData): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every((child: AccordeonData) =>
      this.selectedNodes.has(child)
    );
  }

  descendantsPartiallySelected(node: AccordeonData): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child: AccordeonData) =>
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
   * @param {Accordeon} node - Accordeon - this is the node that was clicked on.
   */
  onCheckboxChange(e: Event, node: AccordeonData): void {
    if (
      this.descendantsPartiallySelected(node) &&
      this.selectedNodes.has(node)
    ) {
      this.selectedNodes.delete(node);
    } else {
      (e as CustomEvent).detail.checked
        ? this.selectedNodes.add(node)
        : this.selectedNodes.delete(node);
      const descendants = this.treeControl.getDescendants(node);
      descendants.forEach((desc: AccordeonData) => {
        this.selectedNodes.has(node)
          ? this.selectedNodes.add(desc)
          : this.selectedNodes.delete(desc);
      });
    }
  }
}
