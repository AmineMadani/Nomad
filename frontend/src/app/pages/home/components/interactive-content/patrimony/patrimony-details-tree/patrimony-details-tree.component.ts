import { Component, OnInit, Input } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Accordeon } from '../patrimony-dataset';

@Component({
  selector: 'app-patrimony-details-tree',
  templateUrl: './patrimony-details-tree.component.html',
  styleUrls: ['./patrimony-details-tree.component.scss'],
})
export class PatrimonyDetailsTreeComponent implements OnInit {
  constructor() {
    this.selectedNodes = new Set<Accordeon>();
    this.dataSource = new MatTreeNestedDataSource<Accordeon>();
    this.treeControl = new NestedTreeControl<Accordeon>((node: Accordeon) => node.children);
  }

  @Input() treeData: Accordeon[];
  dataSource: MatTreeNestedDataSource<Accordeon>;
  treeControl: NestedTreeControl<Accordeon>;
  selectedNodes: Set<Accordeon>;

  ngOnInit() {
    this.dataSource.data = this.treeData;
  }

  hasChild = (_: number, node: Accordeon): boolean => !!node.children && node.children.length > 0;

/**
 * If the checkbox is checked, add the node to the set of selected nodes, otherwise remove it
 * @param {Event} e - Event - the event object
 * @param {Accordeon} node - Accordeon - the node that was clicked
 */
  onCheckboxChange(e: Event, node: Accordeon): void {
    (e as CustomEvent).detail.checked ? this.selectedNodes.add(node) : this.selectedNodes.delete(node);
    if (!!node.children && node.children.length > 0) {
      node.children.forEach((child: Accordeon) => {
        this.onCheckboxChange(e, child);
      })
    }
  }
}
