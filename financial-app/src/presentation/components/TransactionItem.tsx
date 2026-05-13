import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../@types/transaction';

interface Props {
  data: Transaction;
}

const getCategoryIcon = (title: string): any => {
  const t = title.toLowerCase();
  if (t.includes('aluguer') || t.includes('casa')) return 'home-outline';
  if (t.includes('comida') || t.includes('restaurante') || t.includes('mercado')) return 'restaurant-outline';
  if (t.includes('transporte') || t.includes('uber') || t.includes('combustível')) return 'car-outline';
  if (t.includes('salário') || t.includes('bónus')) return 'cash-outline';
  if (t.includes('saúde') || t.includes('farmácia')) return 'medical-outline';
  return 'receipt-outline'; 
};

export function TransactionItem({ data }: Props) {
  const isIncome = data.type === 'income';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' }]}>
        <Ionicons 
          name={getCategoryIcon(data.title)} 
          size={24} 
          color={isIncome ? '#166534' : '#991B1B'} 
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.date}>{data.date.toLocaleDateString('pt-PT')}</Text>
      </View>

      <Text style={[styles.value, { color: isIncome ? '#16A34A' : '#DC2626' }]}>
        {isIncome ? '+ ' : '- '}
        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(data.value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});