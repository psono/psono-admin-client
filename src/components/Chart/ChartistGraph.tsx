import ChartistGraph from 'react-chartist';
import type { ComponentType } from 'react';
import type {
    ChartitGraphLineProps,
    ChartitGraphPieProps,
    ChartitGraphBarProps,
} from 'react-chartist';

// react-chartist exports specialized options but its component uses only the
// base interface. Preserve the actual Line / Bar / Pie contracts.
export default ChartistGraph as ComponentType<
    ChartitGraphLineProps | ChartitGraphPieProps | ChartitGraphBarProps
>;
