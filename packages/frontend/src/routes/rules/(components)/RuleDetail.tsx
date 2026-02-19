import '@gorules/jdm-editor/dist/style.css';

import { useRef, useState } from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import {
  DecisionGraph,
  DecisionGraphRef,
  GraphSimulator,
  JdmConfigProvider,
  Simulation,
} from '@gorules/jdm-editor';
import { Paper, Text, Title } from '@mantine/core';
import { graphql } from '@/graphql';
import { RuleDetailItemFragment } from '@/graphql/graphql';

export const RuleDetailItem = graphql(/* GraphQL */ `
  fragment RuleDetailItem on RuleInstancesSelectItem {
    ruleId
    content
  }
`);

export interface RuleDetailProps {
  rule: RuleDetailItemFragment;
}
export const RuleDetail = ({ rule }: RuleDetailProps) => {
  const graphRef = useRef<DecisionGraphRef>(null);
  const [graph, setGraph] = useState(JSON.parse(rule.content));
  const [graphTrace, setGraphTrace] = useState<Simulation>();
  return (
    <JdmConfigProvider>
      <div style={{ width: '90%', height: '80%' }}>
        <Title>Rule Editor</Title>
        <Text>Caution: the Save feature is not implemented yet.</Text>
        <Paper>
          <DecisionGraph
            ref={graphRef}
            value={graph}
            onChange={(value) => setGraph(value)}
            reactFlowProOptions={{ hideAttribution: true }}
            simulate={graphTrace}
            panels={[
              {
                id: 'simulator',
                title: 'Simulator',
                icon: <PlayCircleOutlined />,
                renderPanel: () => (
                  <GraphSimulator
                    onClear={() => setGraphTrace(undefined)}
                    onRun={async ({ graph, context }) => {
                      const fakeResponse: Simulation = {
                        // anything you want to visualize in the trace:
                        result: {
                          result: { approved: true, limit: 1000 },
                          trace: {
                            start: {
                              id: '1',
                              name: 'Start',
                              input: { context },
                              output: { result: 'terminated' },
                              performance: 'Not Computed',
                              traceData: {},
                            },
                          },
                          snapshot: graph, // echo the graph back
                          performance: '12 ms',
                        },
                        // optional error object if your engine failed
                        // error: { message: 'Something went wrong', data: { ... } },
                      };
                      setGraphTrace(fakeResponse);
                      // try {
                      //   const { data } = await axios.post('/api/simulate', {
                      //     context,
                      //     content: graph,
                      //   });

                      //   setGraphTrace({ result: { ...data, snapshot: graph } });
                      // } catch (e) {
                      //   const errorMessage = match(e)
                      //     .with(
                      //       {
                      //         response: {
                      //           data: {
                      //             type: P.string,
                      //             source: P.string,
                      //           },
                      //         },
                      //       },
                      //       ({ response: { data: d } }) => `${d.type}: ${d.source}`,
                      //     )
                      //     .with({ response: { data: { source: P.string } } }, (d) => d.response.data.source)
                      //     .with({ response: { data: { message: P.string } } }, (d) => d.response.data.message)
                      //     .with({ message: P.string }, (d) => d.message)
                      //     .otherwise(() => 'Unknown error occurred');

                      //   message.error(errorMessage);
                      //   if (axios.isAxiosError(e)) {
                      //     console.log(e);
                      //     setGraphTrace({
                      //       result: {
                      //         result: null,
                      //         trace: e.response?.data?.trace,
                      //         snapshot: graph,
                      //         performance: '',
                      //       },
                      //       error: {
                      //         message: e.response?.data?.source,
                      //         data: e.response?.data,
                      //       },
                      //     });
                      //   }
                      // }
                    }}
                  />
                ),
              },
            ]}
          />
        </Paper>
      </div>
    </JdmConfigProvider>
  );
};
