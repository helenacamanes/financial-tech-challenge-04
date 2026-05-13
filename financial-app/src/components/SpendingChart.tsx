import React, { useMemo } from 'react';
import { View, Dimensions, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Transaction } from '../@types/transaction';
import { COLORS } from '../theme';

interface Props {
  transactions: Transaction[];
}

export default function SpendingChart({ transactions }: Props) {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categories: { [key: string]: number } = {};
    expenses.forEach(t => {
      categories[t.title] = (categories[t.title] || 0) + t.value;
    });

    return Object.keys(categories).map((key, index) => ({
      name: key,
      population: categories[key],
      color: index === 0 ? COLORS.primary : index === 1 ? '#FACC15' : '#FB7185',
      legendFontColor: COLORS.textSecondary,
      legendFontSize: 12,
    }));
  }, [transactions]);

  if (chartData.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distribuição de Gastos</Text>
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 48}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, alignItems: 'center' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 }
});