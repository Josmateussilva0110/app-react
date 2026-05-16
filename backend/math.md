# Cálculo de Valor de Alocação

Este documento descreve as fórmulas matemáticas utilizadas para calcular o valor cobrado em cada tipo de alocação do estacionamento.

---

## Parâmetros Comuns

| Parâmetro | Descrição |
|-----------|-----------|
| `entryAt` | Data e hora de entrada do veículo |
| `exitAt` | Data e hora de saída do veículo (momento atual) |
| `vehicleFixedPrice` — $P_v$ | Taxa fixa cobrada por tipo de veículo, independente do tempo |


---

## 1. Cobrança por Hora 

### Parâmetros

| Parâmetro | Símbolo | Descrição |
|-----------|---------|-----------|
| `pricePerHour` | $P_h$ | Preço por hora no período normal |
| `nightPricePerHour` | $P_n$ | Preço por hora no período noturno |
| `nightPeriod` | — | Intervalo de tempo do período noturno (`{ start: "HH:MM", end: "HH:MM" }`) |

### Sem período noturno

Quando `nightPeriod` é nulo, aplica-se uma taxa única para todas as horas:

$$T_{total} = \frac{exitAt - entryAt}{3{,}600{,}000} \quad \text{(em horas)}$$

$$V = P_v + T_{total} \times P_h$$

### Com período noturno

O tempo total é dividido em horas **normais** e horas **noturnas**:

$$T_{total} = T_{normal} + T_{noturno}$$

Para cada dia $d$ no intervalo $[entryAt,\ exitAt]$, calcula-se a interseção com o período noturno:

$$\text{início}_{noturno}^{(d)} = d + \text{nightPeriod.start}$$
$$\text{fim}_{noturno}^{(d)} = d + \text{nightPeriod.end} \quad \left(+1\ \text{dia se atravessa meia-noite}\right)$$

$$\Delta_d = \max\!\left(0,\ \min(exitAt,\ \text{fim}^{(d)}) - \max(entryAt,\ \text{início}^{(d)})\right)$$

$$T_{noturno} = \sum_{d} \frac{\Delta_d}{3{,}600{,}000}$$

$$T_{normal} = T_{total} - T_{noturno}$$

**Valor final:**

$$\boxed{V = P_v + T_{normal} \times P_h + T_{noturno} \times P_n}$$


---

## 2. Cobrança por Dia 

### Parâmetros

| Parâmetro | Símbolo | Descrição |
|-----------|---------|-----------|
| `dailyRate` | $P_d$ | Preço cobrado por dia de permanência |

### Fórmula

O cálculo conta **dias de calendário**, não horas. O dia de entrada e o dia de saída são sempre contados inteiros:

$$D = \left\lfloor \frac{exitDay - entryDay}{86{,}400{,}000} \right\rfloor + 1$$

onde `entryDay` e `exitDay` são `entryAt` e `exitAt` truncados para `00:00:00` do respectivo dia.

**Valor final:**

$$\boxed{V = P_v + D \times P_d}$$

> **Exemplo:** entrada na segunda às 23:50, saída na terça às 00:10 → $D = 2$ dias (segunda e terça são dias distintos).

---

## 3. Cobrança por Mês

### Parâmetros

| Parâmetro | Símbolo | Descrição |
|-----------|---------|-----------|
| `monthlyRate` | $P_m$ | Preço cobrado por mês de permanência |

### Fórmula

O cálculo conta **meses de calendário**, não dias. O mês de entrada e o mês de saída são sempre contados inteiros:

$$M = (Ano_{saída} - Ano_{entrada}) \times 12 + (Mês_{saída} - Mês_{entrada}) + 1$$

**Valor final:**

$$\boxed{V = P_v + M \times P_m}$$

> **Exemplo:** entrada em 31/jan, saída em 01/fev → $M = 2$ meses (janeiro e fevereiro são meses distintos).

---

## Resumo das Fórmulas

| Modo | Fórmula |
|------|---------|
| **Hora** (sem noturno) | $V = P_v + T_{total} \times P_h$ |
| **Hora** (com noturno) | $V = P_v + T_{normal} \times P_h + T_{noturno} \times P_n$ |
| **Dia** | $V = P_v + D \times P_d$ |
| **Mês** | $V = P_v + M \times P_m$ |
