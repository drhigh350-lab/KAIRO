/**
 * Kairo — KnowledgeGraph
 * The student's personal knowledge map: a graph of ConceptNodes with dependency edges.
 */

import { ConceptNode } from "./ConceptNode.js";
import { RetentionState } from "../utils/constants.js";

export class KnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> ConceptNode
  }

  addConcept(node) {
    this.nodes.set(node.id, node);
  }

  getConcept(id) {
    return this.nodes.get(id);
  }

  hasConcept(id) {
    return this.nodes.has(id);
  }

  /**
   * Get all concepts in a given retention state.
   */
  getByState(state) {
    return Array.from(this.nodes.values()).filter(n => n.retentionState === state);
  }

  /**
   * Get concepts that are currently Fading (urgent review needed).
   */
  getFading() {
    return this.getByState(RetentionState.FADING);
  }

  /**
   * Get prerequisites for a concept.
   */
  getPrerequisites(conceptId) {
    const node = this.nodes.get(conceptId);
    if (!node) return [];
    return node.dependencyIds.map(id => this.nodes.get(id)).filter(Boolean);
  }

  /**
   * Get concepts that depend on this one (reverse dependencies).
   */
  getDependents(conceptId) {
    return Array.from(this.nodes.values()).filter(n =>
      n.dependencyIds.includes(conceptId)
    );
  }

  /**
   * Find weak prerequisites: concepts this one depends on that are NOT Held/Reinforced.
   */
  findWeakPrerequisites(conceptId) {
    const prereqs = this.getPrerequisites(conceptId);
    return prereqs.filter(p =>
      p.retentionState === RetentionState.UNSEEN ||
      p.retentionState === RetentionState.FORMING ||
      p.retentionState === RetentionState.FADING
    );
  }

  /**
   * Get all concepts under a subject/topic/subtopic.
   */
  filter({ subject, topic, subtopic } = {}) {
    return Array.from(this.nodes.values()).filter(n => {
      if (subject && n.subject !== subject) return false;
      if (topic && n.topic !== topic) return false;
      if (subtopic && n.subtopic !== subtopic) return false;
      return true;
    });
  }

  /**
   * Breadth-first search from a concept to find all upstream prerequisites.
   */
  prerequisiteChain(conceptId) {
    const chain = [];
    const visited = new Set();
    const queue = [conceptId];
    while (queue.length > 0) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      const node = this.nodes.get(id);
      if (!node) continue;
      for (const depId of node.dependencyIds) {
        chain.push(depId);
        queue.push(depId);
      }
    }
    return chain.map(id => this.nodes.get(id)).filter(Boolean);
  }

  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()).map(n => n.toJSON())
    };
  }

  static fromJSON(data) {
    const graph = new KnowledgeGraph();
    for (const nodeData of data.nodes || []) {
      graph.addConcept(ConceptNode.fromJSON(nodeData));
    }
    return graph;
  }
}
