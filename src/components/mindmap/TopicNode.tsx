import { Handle, Position } from 'reactflow';

interface TopicNodeProps {
  data: {
    label: string;
    description: string;
  };
}

export const TopicNode = ({ data }: TopicNodeProps) => {
  return (
    <div className="p-4 rounded-lg border border-border bg-background">
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium">{data.label}</div>
      <div className="text-xs text-muted-foreground">{data.description}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}; 