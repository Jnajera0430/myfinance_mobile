// src/components/finance/RevenueChart.tsx
import { View, Text, Dimensions } from 'react-native';
// import { VictoryChart, VictoryArea, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useMemo } from 'react';

const { width } = Dimensions.get('window');

const data = [
  { month: 'Jan', revenue: 4000, users: 2400 },
  { month: 'Feb', revenue: 3000, users: 1398 },
  { month: 'Mar', revenue: 5000, users: 3800 },
  { month: 'Apr', revenue: 4780, users: 3908 },
  { month: 'May', revenue: 5890, users: 4800 },
  { month: 'Jun', revenue: 6390, users: 3800 },
  { month: 'Jul', revenue: 7490, users: 4300 },
  { month: 'Aug', revenue: 8200, users: 5100 },
  { month: 'Sep', revenue: 7800, users: 4900 },
  { month: 'Oct', revenue: 9100, users: 5500 },
  { month: 'Nov', revenue: 8500, users: 5200 },
  { month: 'Dec', revenue: 10200, users: 6100 },
];

const RevenueChart = () => {
  // Format data for Victory (needs x and y keys)
  const revenueData = data.map((item, index) => ({ x: index, y: item.revenue, month: item.month }));
  const usersData = data.map((item, index) => ({ x: index, y: item.users, month: item.month }));

  // Custom tooltip component
  const CustomTooltip = (props: any) => {
    const { datum, text } = props;
    if (!datum) return null;
    const isRevenue = text?.includes('revenue');
    const value = isRevenue ? datum.y : datum.y;
    const formattedValue = isRevenue 
      ? `$${value.toLocaleString()}` 
      : value.toLocaleString();
    const label = isRevenue ? 'Revenue' : 'Users';
    return (
      <View style={{ backgroundColor: 'hsl(222, 47%, 8%)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'hsl(217, 33%, 17%)' }}>
        <Text style={{ color: 'hsl(210, 40%, 98%)', fontSize: 12, fontWeight: 'bold' }}>
          {datum.month}
        </Text>
        <Text style={{ color: isRevenue ? 'hsl(199, 89%, 48%)' : 'hsl(280, 85%, 65%)', fontSize: 12 }}>
          {label}: {formattedValue}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="bg-card rounded-2xl overflow-hidden border border-border"
    >
      <View className="p-5">
        <Text className="text-lg font-semibold text-foreground mb-1">Revenue Overview</Text>
        <Text className="text-sm text-muted-foreground mb-4">Monthly revenue and user growth</Text>
        
        <Svg height={0} width={0}>
          <Defs>
            <SvgLinearGradient id="gradientRevenue" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity="0" />
            </SvgLinearGradient>
            <SvgLinearGradient id="gradientUsers" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="hsl(280, 85%, 65%)" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="hsl(280, 85%, 65%)" stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
        </Svg>

        {/* <VictoryChart
          width={width - 40}
          height={280}
          padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }) => `${datum.month}\n${datum.y}`}
              labelComponent={<VictoryTooltip flyoutComponent={<CustomTooltip />} />}
            />
          }
        >
          <VictoryAxis
            tickValues={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
            tickFormat={data.map(d => d.month)}
            style={{
              tickLabels: { fill: 'hsl(215, 20%, 55%)', fontSize: 10, angle: -45 },
              axis: { stroke: 'hsl(217, 33%, 17%)' },
              ticks: { size: 0 }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(tick) => `$${tick / 1000}k`}
            style={{
              tickLabels: { fill: 'hsl(215, 20%, 55%)', fontSize: 10 },
              axis: { stroke: 'hsl(217, 33%, 17%)' },
              grid: { stroke: 'hsl(217, 33%, 17%)', strokeDasharray: '3 3' }
            }}
          />
          <VictoryArea
            data={revenueData}
            x="x"
            y="y"
            style={{
              data: { fill: 'url(#gradientRevenue)', stroke: 'hsl(199, 89%, 48%)', strokeWidth: 2 }
            }}
            interpolation="monotoneX"
          />
          <VictoryArea
            data={usersData}
            x="x"
            y="y"
            style={{
              data: { fill: 'url(#gradientUsers)', stroke: 'hsl(280, 85%, 65%)', strokeWidth: 2 }
            }}
            interpolation="monotoneX"
          />
        </VictoryChart> */}
      </View>
    </LinearGradient>
  );
};

export default RevenueChart;