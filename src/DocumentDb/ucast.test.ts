import { CompoundCondition, FieldCondition, guard } from '@ucast/mongo2js';
import { interpret } from '@ucast/js';
import { describe, it, expect, vi } from 'vitest';

describe('Ucast tests', () => {

    const project1 = {
        id: "proj-1",
        name: "Old Project",
        owner: "John Doe"
    }

    const project2 = {
        id: "proj-2",
        name: "New Project",
        owner: "Jane Doe"
    }

    const query = { name: "Old Project" }

    const securityFilter = {
        "operator": "eq",
        "value": "John Doe",
        "field": "owner"
    }

    const projects = [project1, project2]
    const expected = [project1]

    it('should evaluate js a simple js condition', () => {

        const condition = new CompoundCondition('and', [
            new FieldCondition('gt', 'x', 5),
            new FieldCondition('lt', 'y', 10),
        ]);

        expect(interpret(condition, { x: 2, y: 1 })).toEqual(false); // false
        expect(interpret(condition, { x: 6, y: 7 })).toEqual(true); // true

    })

    it('should evaluate a composite condition', () => {
        const searchFilter = guard(query).ast

        const combinedFilter = {
            operator: "and",
            value: [searchFilter, securityFilter]
        }

        const predicate = (o: object) => interpret(combinedFilter as CompoundCondition, o);
        expect(projects.filter(predicate)).toEqual(expected)

    });

});
