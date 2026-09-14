// src/components/finance/IncomeExpenseChart.tsx
import { View, Text, Dimensions } from 'react-native';
// import { VictoryContainer } from 'victory-core';
// import { VictoryPie, VictoryLegend, VictoryTooltip, VictoryContainer } from 'victory-native';
import { useFinance } from '../../contexts/FinanceContext';
// import { useFinance as useFinanceLocal } from '../../contexts/FinanceContext';
// import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

const { width } = Dimensions.get('window');

const IncomeExpenseChart = () => {
//   const { isDemo } = useAuth();
  const { summary } = useFinance();
//   const { summary: summaryLocal } = useFinanceLocal();

  // Prepare data for Victory
  const data = [
    { 
      name: 'Ingresos', 
      value: summary.totalIncome, 
    //   value: isDemo ? summaryLocal.totalIncome : summary.totalIncome, 
      color: '#3b82f6', // blue
      legendColor: '#3b82f6'
    },
    { 
      name: 'Gastos Fijos', 
      value: summary.totalFixedExpenses,
    //   value: isDemo ? summaryLocal.totalFixedExpenses : summary.totalFixedExpenses,
      color: '#ef4444', // red
      legendColor: '#ef4444'
    },
    { 
      name: 'Gastos Variables', 
    //   value: isDemo ? summaryLocal.totalVariableExpenses : summary.totalVariableExpenses,
      value: summary.totalVariableExpenses,
      color: '#f59e0b', // amber
      legendColor: '#f59e0b'
    },
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Si no hay datos, mostrar mensaje
  if (data.length === 0) {
    return (
      <View className="bg-card rounded-2xl p-5 border border-border">
        <Text className="text-lg font-semibold text-foreground mb-2">
          Distribución Financiera
        </Text>
        <Text className="text-muted-foreground text-center py-8">
          No hay datos suficientes para mostrar el gráfico.
        </Text>
      </View>
    );
  }

  // Preparar datos para VictoryPie
  const pieData = data.map((item, index) => ({
    x: item.name,
    y: item.value,
    color: item.color,
    label: `${item.name}\n${formatCurrency(item.value)}`,
  }));

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="bg-card rounded-2xl overflow-hidden border border-border"
      style={{ backgroundColor: 'transparent' }}
    >
      <View className="p-5">
        <Text className="text-lg font-semibold text-foreground mb-2">
          Distribución Financiera
        </Text>

        {/* <VictoryPie
          data={pieData}
          width={width - 40}
          height={280}
          colorScale={data.map(d => d.color)}
          innerRadius={70}
          radius={110}
          labelRadius={130}
          style={{
            labels: {
              fontSize: 12,
              fill: '#6b7280',
              fontWeight: '500',
            },
            data: {
              stroke: '#1f2937',
              strokeWidth: 1,
            },  
          }}
          labels={({ datum }: { datum: any }) => `${datum.x}\n${formatCurrency(datum.y)}`}
          labelComponent={
            <VictoryTooltip
              text={({ datum }: { datum: any }) => `${datum.x}: ${formatCurrency(datum.y)}`}
              flyoutStyle={{ fill: '#1f2937', stroke: '#374151', strokeWidth: 1 }}
              style={{ fontSize: 12, fill: '#f3f4f6' }}
            />
          }
          containerComponent={<VictoryContainer responsive={true} />}
          padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        /> */}

        {/* Leyenda personalizada */}
        <View className="flex-row flex-wrap justify-center gap-4 mt-4 pt-2 border-t border-border/50">
          {data.map((item, idx) => (
            <View key={idx} className="flex-row items-center gap-2">
              <View style={{ width: 12, height: 12, backgroundColor: item.color, borderRadius: 6 }} />
              <Text className="text-sm text-muted-foreground">{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

export default IncomeExpenseChart;