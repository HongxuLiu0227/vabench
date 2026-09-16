# WIS 抽查对照表

用法：对每个 workbook，打开它目录里的 PNG 截图，逐视图核对解析结果。
重点核对 🟡推断 的（explicit 是文件明写，基本不会错）。
核对项：①图类型对不对 ②rows/cols 翻译对不对 ③颜色按什么字段 ④交互联动对不对

---

## 📁 10115_dash_dashboard0.png__Suicide_20Trends

截图文件：`Dashboard 1.png`

### 视图「Sheet 1」→ **line** 🟢明写
- rows: [Sum]suicides_no
- cols: year
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sheet 2」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: [Sum]suicides_no
- cols: generation
- 颜色: 按 suicides_no
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sheet 3」→ **square** 🟢明写
- rows: age
- 颜色: 按 suicides_no
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sheet 4」→ **line** 🟢明写
- rows: [Sum]suicides_no
- cols: gdp_for_year ($)
- ⚡ 此视图响应交互动作（被联动）

**交互**: 在「Sheet 1」上 on-select → tsc:tsl-filter → 影响 Sheet 2, Sheet 3, Sheet 4

**交互**: 在「Sheet 2」上 on-select → tsc:tsl-filter → 影响 整个仪表盘

**交互**: 在「Sheet 4」上 on-select → tsc:tsl-filter → 影响 Sheet 1, Sheet 2, Sheet 3

---

## 📁 1009_dash_dashboard0.png__Crime_20in_20DC_map_v10.2

截图文件：`Dashboard 1.png`

### 视图「Crime」→ **line** 🟡推断
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Number of Records
- cols: [tmn]REPORTDATETIME
- 颜色: 按 OFFENSE
### 视图「Crimecapita map」→ **map**（填充地图） 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `lat_long_or_geometry`
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Calculation_1773503521018417154
### 视图「Crimemap」→ **map**（填充地图） 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `lat_long_or_geometry`
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Number of Records
### 视图「Map」→ **pie** 🟢明写
- rows: Y
- cols: X
- 颜色: 按 OFFENSE
### 视图「Total」→ **line** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Number of Records × [Sum]Number of Records
- cols: [Month]REPORTDATETIME
- 颜色: 按 METHOD

**交互**: 在「Map」上 on-select → tsc:tsl-filter → 影响 整个仪表盘

**交互**: 在「Crime」上 on-select → tsc:tsl-filter → 影响 整个仪表盘

**交互**: 在「Map」上 on-select → tsc:brush → 影响 整个仪表盘

**控件/图例**: text(); filter(OFFENSE); color(OFFENSE); text(); text()

---

## 📁 10026_dash_dashboard0.png__Walmart-Sales-Analysis

截图文件：`Dashboard 2.png`

### 视图「Basic FIlter」→ **bar** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `dim_plus_measure`
- rows: [Sum]Sales
- cols: State
### 视图「Bubble CHart」→ **circle** 🟢明写　🚫未上仪表盘（截图里没有，不用核对）
- 颜色: 按 Category
### 视图「Cascading Filter」→ **line** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Sales
- cols: [tmn]Order Date
### 视图「Comparison Line Chart」→ **line** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Sales
- cols: [Month]Order Date
- 颜色: 按 Order Date
### 视图「Conditional Filter」→ **bar** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `dim_plus_measure`
- rows: Customer Name
- cols: [Sum]Sales
### 视图「Dual Line Chart」→ **line** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Profit × [Sum]Sales
- cols: [tmn]Order Date
- 颜色: 按 Measure Names
- 颜色: 按 Measure Names
- 颜色: 按 Measure Names
### 视图「Hierarchical Filter」→ **line** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Sales
- cols: [tmn]Order Date
### 视图「Hierarchy」→ **map**（填充地图） 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `lat_long_or_geometry`
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Profit
### 视图「If Else」→ **text** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `dims_only`
- rows: Order ID
- cols: []Measure Names
### 视图「KPI」→ **shape** 🟢明写　🚫未上仪表盘（截图里没有，不用核对）
- rows: Sub-Category
- cols: [Year]Order Date
### 视图「Multi Bar Chart」→ **bar** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `measures_only`
- rows: [Sum]Sales × [Sum]Profit
### 视图「Profit in Percentages」→ **text** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `dims_only`
- rows: State
- cols: []Measure Names
### 视图「Scatter Plot」→ **circle** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `measure_vs_measure`
- rows: [Sum]Profit
- cols: [Sum]Sales
### 视图「State Wise Profit」→ **map**（填充地图） 🟡推断
- 推断依据: `lat_long_or_geometry`
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Profit
- ⚡ 此视图响应交互动作（被联动）
### 视图「State wise Sales」→ **map**（散点地图，点形状 circle） 🟡推断
- 推断依据: `lat_long_or_geometry`
- rows: Latitude (generated)
- cols: Longitude (generated)
- ⚡ 此视图响应交互动作（被联动）
### 视图「Subcategory Vs Sales」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: [Sum]Sales
- cols: Sub-Category
- ⚡ 此视图响应交互动作（被联动）
### 视图「TreeMap」→ **treemap** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `size_color_text_no_shelves`
- 颜色: 按 Profit
### 视图「Trend Line CHart」→ **line** 🟡推断
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Sales
- cols: [tmn]Order Date
- ⚡ 此视图响应交互动作（被联动）
### 视图「Wildcard FIlter」→ **text** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `dims_only`
- rows: Product Name

**交互**: 在「Subcategory Vs Sales」上 on-select → tsc:tsl-filter → 影响 State Wise Profit, State wise Sales, Trend Line CHart

**交互**: 在「State Wise Profit」上 on-select → tsc:tsl-filter → 影响 State wise Sales, Subcategory Vs Sales, Trend Line CHart

**交互**: 在「Trend Line CHart」上 on-select → tsc:tsl-filter → 影响 State Wise Profit, State wise Sales, Subcategory Vs Sales

**交互**: 在「State wise Sales」上 on-select → tsc:tsl-filter → 影响 整个仪表盘

**控件/图例**: color(Profit)

---

## 📁 160_dash_dashboard0.png__Swimmers_20Overview

截图文件：`Swimmers Overview.png`

### 视图「Swimmers by Age」→ **bar** 🟢明写
- rows: GenderSwimmer × [CountD]SwimmerId
- cols: BirthDateSwimmers (copy)_818529261980127232
- 颜色: 按 GenderSwimmer，显式颜色 ['#72b966']
- ⚡ 此视图响应交互动作（被联动）
### 视图「Swimmers by Country」→ **treemap** 🟡推断
- 推断依据: `size_color_text_no_shelves`
- 颜色: 按 SwimmerId
- ⚡ 此视图响应交互动作（被联动）
### 视图「Swimmers by Rank」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: RankSwimmers
- cols: RankTrainer × [CountD]SwimmerId

**交互**: 在「Swimmers by Rank」上 on-select → tsc:tsl-filter → 影响 Swimmers by Age, Swimmers by Country

**控件/图例**: filter(CountrySwimmers); filter(Сountry); color(GenderSwimmer)

---

## 📁 10005_dash_dashboard0.png__dashboard

截图文件：`Profit Dashboard.png`

### 视图「Profit By Category」→ **bar** 🟢明写
- rows: [Sum]Profit
- 颜色: 按 Order Date
- ⚡ 此视图响应交互动作（被联动）
### 视图「Profit Map」→ **map**（填充地图） 🟢明写
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Profit
- ⚡ 此视图响应交互动作（被联动）

**交互**: 在「?」上 on-select → tsc:tsl-filter → 影响 Profit By Category, Profit Map

**控件/图例**: color(Profit)

---

## 📁 10217_dash_dashboard0.png__Sales_20Analytics

截图文件：`Dashboard 1.png`

### 视图「Products Ouantity Sold per Order」→ **circle** 🟡推断
- 推断依据: `measure_vs_measure`
- rows: [Count]Quantity
- cols: Quantity (bin)
- ⚡ 此视图响应交互动作（被联动）
### 视图「Profit Card」→ **text** 🟡推断
- 推断依据: `text_only_no_shelves`
- ⚡ 此视图响应交互动作（被联动）
### 视图「Quantity Card」→ **text** 🟡推断
- 推断依据: `text_only_no_shelves`
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sales By Category」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: Category
- cols: [Sum]Sales
- 颜色: 按 Sales，显式颜色 ['#59a14f']
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sales Card」→ **text** 🟡推断
- 推断依据: `text_only_no_shelves`
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sales Map」→ **map**（填充地图） 🟡推断
- 推断依据: `lat_long_or_geometry`
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Sales
- ⚡ 此视图响应交互动作（被联动）
### 视图「Yearly Sales」→ **line** 🟡推断
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Sales
- cols: [tmn]Order Date
- ⚡ 此视图响应交互动作（被联动）

**交互**: 在「Sales By Category」上 on-select → tsc:tsl-filter → 影响 Products Ouantity Sold per Order, Profit Card, Quantity Card, Sales Card, Sales Map, Yearly Sales

**交互**: 在「Sales Map」上 on-select → tsc:tsl-filter → 影响 Products Ouantity Sold per Order, Profit Card, Quantity Card, Sales By Category, Sales Card, Yearly Sales

**控件/图例**: text(); filter(Order Date)

---

## 📁 10394_dash_dashboard0.png__TableauWorkbook

截图文件：`StartEndMaps.png`

### 视图「EndStations」→ **circle** 🟡推断
- 推断依据: `measure_vs_measure`
- rows: end station latitude
- cols: end station longitude
- 颜色: 按 end station id
- ⚡ 此视图响应交互动作（被联动）
### 视图「GenderCountxAge」→ **bar** 🟡推断　🚫未上仪表盘（截图里没有，不用核对）
- 推断依据: `dim_plus_measure`
- rows: birth year
- cols: [Count]gender
- 颜色: 按 gender
### 视图「GenderStartTime」→ **bar** 🟢明写　🚫未上仪表盘（截图里没有，不用核对）
- rows: Calculation_1089589689619611648 × [Count]Calculation_1089589689619611648
- cols: [Hour]stoptime
- 颜色: 按 gender
### 视图「GenderStopTime」→ **bar** 🟢明写　🚫未上仪表盘（截图里没有，不用核对）
- rows: gender × [Count]gender
- cols: [Hour]stoptime
- 颜色: 按 gender
### 视图「StartStations」→ **circle** 🟡推断
- 推断依据: `measure_vs_measure`
- rows: start station latitude
- cols: start station longitude
- 颜色: 按 start station id
- ⚡ 此视图响应交互动作（被联动）

**交互**: 在「StartStations」上 on-select → tsc:tsl-filter → 影响 EndStations

**交互**: 在「EndStations」上 on-select → tsc:tsl-filter → 影响 StartStations

---

## 📁 10581_dash_dashboard0.png__COVID_Peru

截图文件：`Dashboard 1.png`

### 视图「Acumulado」→ **line** 🟡推断
- 推断依据: `temporal_plus_measure`
- rows: [Cumulative]cnt:Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- cols: [tdy]FECHA
- ⚡ 此视图响应交互动作（被联动）
### 视图「Caso」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: CASO
- cols: [Count]Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- ⚡ 此视图响应交互动作（被联动）
### 视图「Crono」→ **line** 🟡推断
- 推断依据: `temporal_plus_measure`
- rows: [fVal]cnt:Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- cols: [tdy]FECHA
- 颜色: 按 Forecast Indicator
- ⚡ 此视图响应交互动作（被联动）
### 视图「Departamento」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: DEPARTAMENTO
- cols: [Count]Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- 颜色: 按 Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- ⚡ 此视图响应交互动作（被联动）
### 视图「Edad」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: [Count]Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- cols: EDAD
- ⚡ 此视图响应交互动作（被联动）
### 视图「Mapa」→ **map**（散点地图，点形状 circle） 🟡推断
- 推断依据: `lat_long_or_geometry`
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sexo」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: SEXO
- cols: [Count]Posit_death_20200721.csv_ADD08063889A4CAF81A51E6940A509DA
- 颜色: 按 SEXO
- ⚡ 此视图响应交互动作（被联动）

**交互**: 在「Caso」上 on-select → tsc:tsl-filter → 影响 Acumulado, Crono, Departamento, Edad, Mapa, Sexo

**交互**: 在「Mapa」上 on-select → tsc:tsl-filter → 影响 Caso, Crono, Departamento, Edad, Sexo

**交互**: 在「Sexo」上 on-select → tsc:tsl-filter → 影响 Acumulado, Caso, Crono, Departamento, Edad, Mapa

---

## 📁 10101_dash_dashboard0.png__kiva_20loans_20project

截图文件：`Dashboard 1.png`

### 视图「Area chart by timeline」→ **area** 🟢明写
- rows: [Sum]funded_amount
- cols: [tmn]funded_time
- ⚡ 此视图响应交互动作（被联动）
### 视图「Barchart by Sector」→ **bar** 🟡推断
- 推断依据: `dim_plus_measure`
- rows: sector
- cols: [PercentOfTotal]cnt:kiva_loans.csv_2BA18C77CD3440528E7BD09B15CB0911
- ⚡ 此视图响应交互动作（被联动）
### 视图「Gender piechart」→ **pie** 🟢明写
- 颜色: 按 Calculation_1237364048367902725
- ⚡ 此视图响应交互动作（被联动）
### 视图「Map by Gender Rate」→ **map**（填充地图） 🟢明写
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Calculation_1237364048358903811

**交互**: 在「Map by Gender Rate」上 on-select → tsc:tsl-filter → 影响 Area chart by timeline, Barchart by Sector, Gender piechart

---

## 📁 10197_dash_dashboard0.png__Sample_20Dashboard

截图文件：`Dashboard.png`

### 视图「Sheet 1」→ **bar** 🟡推断
- 推断依据: `measures_only`
- cols: [Sum]Profit
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sheet 2」→ **map**（填充地图） 🟢明写
- rows: Latitude (generated)
- cols: Longitude (generated)
- 颜色: 按 Profit
- ⚡ 此视图响应交互动作（被联动）
### 视图「Sheet 3」→ **line** 🟡推断
- 推断依据: `temporal_plus_measure`
- rows: [Sum]Profit
- cols: [tqr]Order Date
- 颜色: 按 Category
- ⚡ 此视图响应交互动作（被联动）

**交互**: 在「Sheet 2」上 on-select → tsc:tsl-filter → 影响 Sheet 1, Sheet 3

**交互**: 在「Sheet 3」上 on-select → tsc:tsl-filter → 影响 Sheet 1, Sheet 2

**控件/图例**: text(); text()