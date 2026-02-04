# 📦 Stock Flow Pro

> **Sistema Inteligente de Gestão de Estoque e Inventário**

![Badge Status](https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge)
![Badge Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![Badge FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)
![Badge Bootstrap](https://img.shields.io/badge/Frontend-Bootstrap%205-purple?style=for-the-badge&logo=bootstrap)

O **Stock Flow Pro** é uma solução completa para controle de estoque, desenvolvida para unir a performance do **FastAPI** no backend com uma interface moderna e responsiva no frontend. O sistema permite rastreabilidade total de produtos, alertas automáticos e análise de dados em tempo real.

---

## 🖥️ Telas e Funcionalidades

### 📊 Dashboard Interativo (Analytics)
Visão geral do negócio com métricas em tempo real.
* **Gráficos Dinâmicos:** Visualização do nível de estoque via Chart.js.
* **KPIs Financeiros:** Valor total em estoque calculado automaticamente.
* **Feed de Atividades:** Acompanhamento das últimas movimentações (Entradas/Saídas) com cálculo de tempo relativo (ex: "há 5 min").
* **Alertas Inteligentes:** O sistema avisa visualmente quando produtos atingem o estoque mínimo.

### 📦 Gestão de Produtos (CRUD Completo)
* **Cadastro/Edição:** Interface modal intuitiva com conversão automática de valores (R$).
* **Busca em Tempo Real:** Filtre produtos instantaneamente enquanto digita.
* **Histórico de Auditoria:** Visualize o histórico individual de cada produto (timeline de entradas e saídas).
* **Segurança:** Impede a exclusão acidental e vendas sem estoque suficiente.

### 📑 Relatórios Profissionais
* **Exportação Excel (.xlsx):** Gera planilhas formatadas, coloridas e estilizadas automaticamente usando `openpyxl`.
* **Filtros de Reposição:** Lista automática de produtos críticos.

### 🎨 UI/UX Moderna
* **Dark/Light Mode:** Alternância de tema com persistência (lembra a escolha do usuário).
* **Design Responsivo:** Funciona perfeitamente em Desktop e Mobile.

---

## 🛠️ Tecnologias Utilizadas

### Backend
* **Python 3.x**
* **FastAPI:** Framework moderno e de alta performance.
* **SQLAlchemy:** ORM para manipulação do banco de dados SQLite.
* **Pydantic:** Validação de dados robusta.
* **OpenPyXL:** Geração de relatórios Excel nativos.

### Frontend
* **HTML5 / CSS3 (Variáveis CSS)**
* **Jinja2:** Template Engine para renderização no servidor.
* **Bootstrap 5:** Framework visual responsivo.
* **JavaScript (Vanilla):** Lógica do cliente (Fetch API, DOM Manipulation).
* **Chart.js:** Visualização de dados.
* **SweetAlert2:** Alertas e modais bonitos.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* Python 3.9 ou superior instalado.

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/Hiann/Stock-Flow.git](https://github.com/Hiann/Stock-Flow.git)
    cd Stock-Flow
    ```

2.  **Crie um ambiente virtual (Recomendado)**
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Linux/Mac
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instale as dependências**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Execute o servidor**
    ```bash
    python -m uvicorn app.main:app --reload
    ```

5.  **Acesse no navegador**
    * **Sistema Web:** [http://localhost:8000](http://localhost:8000)
    * **Documentação API (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Estrutura do Projeto

```text
Stock-Flow-API/
│
├── app/
│   ├── main.py       # Rotas e Configurações (Backend + Frontend Routes)
│   ├── models.py     # Tabelas do Banco de Dados
│   ├── schemas.py    # Validação de Dados (Pydantic)
│   ├── crud.py       # Regras de Negócio e Queries
│   └── database.py   # Conexão SQLite
│
├── static/           # Arquivos Estáticos
│   ├── css/          # Estilos e Variáveis de Tema
│   ├── js/           # Lógica do Frontend (API Fetch, Charts)
│   └── favicon.png   # Ícone do sistema
│
├── templates/        # Arquivos HTML (Jinja2)
│   ├── base.html     # Layout base (Menu, Header)
│   ├── index.html    # Dashboard
│   ├── products.html # Gestão de Produtos
│   └── movements.html# Tela de Movimentação
│
├── stock.db          # Banco de Dados (Gerado automaticamente)
└── requirements.txt  # Lista de dependências

## 👨‍💻 Autor

<div align="center">

<h3>Hiann Alexander Mendes de Oliveira</h3>

<p>
    🎓 Estudante de Sistemas de Informação - IF Goiano (Campus Urutaí)<br>
    💻 Desenvolvedor Backend<br>
    📍 Goiânia, Goiás
</p>

<a href="https://www.linkedin.com/in/hiann-alexander" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-Conectar-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Badge">
</a>

</div>
