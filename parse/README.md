# Tableau .twbx 文件解析工具

## 文件结构

```
parse/
├── parse_twbx.py      # 主程序脚本
├── input_twbx/        # 输入文件夹（存放要处理的 .twbx 文件）
├── output_twbx/       # 输出文件夹
│   └── {twbx文件名}/  # 每个 .twbx 文件对应一个输出文件夹
│       ├── {twb文件}.twb  # 提取的 .twb 文件
│       └── data/          # 数据文件夹
│           └── {csv文件}.csv  # 转换后的 CSV 文件
└── requirements.txt   # Python 依赖包列表
```

## 使用方法

### 方法 1: 批量处理（推荐）

1. 将 `.twbx` 文件放入 `input_twbx` 文件夹
2. 运行脚本（不提供参数）：
   ```bash
   python parse_twbx.py
   ```
3. 程序会自动处理 `input_twbx` 文件夹中的所有 `.twbx` 文件

### 方法 2: 处理单个文件

```bash
python parse_twbx.py <twbx文件路径>
```

如果文件在 `input_twbx` 文件夹中，可以直接使用文件名：
```bash
python parse_twbx.py 437_dash_dashboard0.png__data_insta_EDA.twbx
```

## 输出结构

每个 `.twbx` 文件解析后，会在 `output_twbx` 文件夹下创建一个以文件名命名的文件夹：

```
output_twbx/
└── Dashboard_201/
    ├── Dashboard_201.twb    # 提取的 .twb 文件
    └── data/                # 数据文件夹
        ├── Orders.csv
        ├── Returns.csv
        └── People.csv
```

## 支持的数据格式

- `.hyper` - Tableau Hyper 数据提取文件
- `.xls` / `.xlsx` - Excel 文件（支持多工作表）
- `.tde` - Tableau 旧版数据提取文件
- `.csv` - CSV 文件（直接复制）

## 安装依赖

```bash
pip install -r requirements.txt
```

## 注意事项

- 确保 `input_twbx` 和 `output_twbx` 文件夹存在
- 处理大文件时可能需要较长时间
- CSV 文件使用 UTF-8 编码（带 BOM）保存，确保中文正确显示

