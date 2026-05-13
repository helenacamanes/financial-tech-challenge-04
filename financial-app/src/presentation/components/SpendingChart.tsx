import React, { useMemo, memo } from 'react'; // 1. Importação do 'memo'
import { View, Dimensions, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Transaction } from '../domain/@types/transaction'; // Ajustado para nova pasta domain
import { COLORS } from '../presentation/theme'; // Ajustado para nova pasta presentation

interface Props {
  transactions: Transaction[];
}

// 2. Envolvendo o componente em React.memo
const SpendingChart = memo(({ transactions }: Props) => {
  
  // 3. O useMemo isola o cálculo pesado da lógica de negócio
  const chartData = useMemo(() => {
    // Filtramos apenas as despesas
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Agrupamento por categoria
    const categories: { [key: string]: number } = {};
    expenses.forEach(t => {
      // Usamos t.category conforme o novo schema do repositório
      categories[t.title] = (categories[t.title] || 0) + t.value; 
    });

    // Mapeamento para o formato do react-native-chart-kit
    return Object.keys(categories).map((key, index) => ({
      name: key,
      population: categories[key],
      color: index === 0 ? COLORS.primary : index === 1 ? '#FACC15' : '#FB7185',
      legendFontColor: COLORS.textSecondary,
      legendFontSize: 12,
    }));
  }, [transactions]); // Só recalcula se a referência da lista de transações mudar

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
});

const styles = StyleSheet.create({
  container: { marginTop: 24, alignItems: 'center' },
  title: { 
    color: COLORS.text, 
    fontSize: 16, 
    fontWeight: 'bold', 
    alignSelf: 'flex-start', 
    marginBottom: 10 
  }
});

export default SpendingChart;