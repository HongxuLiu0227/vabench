import type { TableData } from '../../types'

import { formatNumber, formatCurrency } from '../../utils/calculatedFields';

interface CustomTableViewProps {
  data: TableData[]
  title?: string
  valueFormat?: 'number' | 'currency' | 'percentage' | 'none'
}

export function CustomTableView({
  data,
  title,
  valueFormat = 'number',
}: CustomTableViewProps) {
  const formatValue = (value: number | string): string => {
    if (typeof value === 'string') return value

    switch (valueFormat) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'number':
        return formatNumber(value)
      default:
        return String(value)
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '10px' }}>
      {title && (
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '15px',
            fontFamily: 'sans-serif',
          }}
        >
          {title}
        </div>
      )}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'sans-serif',
          fontSize: '13px',
        }}
      >
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.key}
              style={{
                borderBottom: index < data.length - 1 ? '1px solid #e0e0e0' : 'none',
              }}
            >
              <td
                style={{
                  padding: '10px 8px',
                  textAlign: 'left',
                  color: '#333',
                  fontWeight: '500',
                }}
              >
                {row.key}
              </td>
              <td
                style={{
                  padding: '10px 8px',
                  textAlign: 'right',
                  color: '#666',
                }}
              >
                {formatValue(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: string
  size?: 'small' | 'medium' | 'large'
}

export function SummaryCard({
  title,
  value,
  subtitle,
  size = 'medium',
}: SummaryCardProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          title: '12px',
          value: '24px',
          subtitle: '10px',
        }
      case 'large':
        return {
          title: '16px',
          value: '48px',
          subtitle: '14px',
        }
      default:
        return {
          title: '14px',
          value: '36px',
          subtitle: '12px',
        }
    }
  }

  const sizes = getSizeStyles()

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: sizes.title,
          fontWeight: '500',
          color: '#666',
          marginBottom: '10px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: sizes.value,
          fontWeight: '700',
          color: '#333',
          marginBottom: subtitle ? '5px' : '0',
        }}
      >
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: sizes.subtitle,
            color: '#999',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}
