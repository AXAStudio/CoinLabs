import json
import requests
import streamlit as st

st.set_page_config(page_title="Crypto Admin", page_icon="🪙", layout="centered")

if "base_url" not in st.session_state:
    st.session_state.base_url = "http://localhost:8000"

with st.sidebar:
    st.title("Settings")
    st.session_state.base_url = st.text_input("API Base URL", st.session_state.base_url)
    st.caption("Example: http://localhost:8000")

st.title("Crypto Admin Dashboard")

tab_add, tab_list, tab_get, tab_update, tab_delete = st.tabs(["Add", "List", "Get", "Update Price", "Delete"])

def _handle_resp(r):
    try:
        return r.status_code, r.json()
    except Exception:
        return r.status_code, {"text": r.text}

with tab_add:
    st.subheader("Add Crypto")
    with st.form("add_form", clear_on_submit=False):
        symbol = st.text_input("Symbol", "BTC")
        price = st.number_input("Price", min_value=0.0, value=50000.0, step=0.01, format="%.8f")
        same_init = st.checkbox("initial_price = price", value=True)
        init_val = price if same_init else st.number_input("Initial Price", min_value=0.0, value=50000.0, step=0.01, format="%.8f", key="init_price_box")
        submit = st.form_submit_button("Add")
    if submit:
        if not symbol.strip():
            st.warning("Enter a symbol.")
        else:
            payload = {"symbol": symbol.strip(), "price": float(price), "initial_price": float(init_val)}
            try:
                r = requests.post(f"{st.session_state.base_url}/crypto/add", json=payload, timeout=10)
                code, body = _handle_resp(r)
                st.write(f"Status: {code}")
                st.json(body)
            except requests.RequestException as e:
                st.error(str(e))

with tab_list:
    st.subheader("List Cryptos")
    if st.button("Refresh List"):
        try:
            r = requests.get(f"{st.session_state.base_url}/crypto/list", timeout=10)
            code, body = _handle_resp(r)
            st.write(f"Status: {code}")
            if isinstance(body, list):
                st.dataframe(body, use_container_width=True)
            else:
                st.json(body)
        except requests.RequestException as e:
            st.error(str(e))

with tab_get:
    st.subheader("Get Crypto")
    symbol = st.text_input("Symbol", "BTC", key="get_symbol")
    if st.button("Fetch", key="btn_get"):
        if not symbol.strip():
            st.warning("Enter a symbol.")
        else:
            try:
                r = requests.get(f"{st.session_state.base_url}/crypto/{symbol.strip()}", timeout=10)
                code, body = _handle_resp(r)
                st.write(f"Status: {code}")
                st.json(body)
            except requests.RequestException as e:
                st.error(str(e))

with tab_update:
    st.subheader("Update Price")
    u_symbol = st.text_input("Symbol", "BTC", key="upd_symbol")
    u_price = st.number_input("New Price", min_value=0.0, value=50500.0, step=0.01, format="%.8f")
    if st.button("Update Price"):
        if not u_symbol.strip():
            st.warning("Enter a symbol.")
        else:
            try:
                r = requests.put(f"{st.session_state.base_url}/crypto/{u_symbol.strip()}/price", params={"price": float(u_price)}, timeout=10)
                code, body = _handle_resp(r)
                st.write(f"Status: {code}")
                st.json(body)
            except requests.RequestException as e:
                st.error(str(e))

with tab_delete:
    st.subheader("Delete Crypto")
    d_symbol = st.text_input("Symbol", "BTC", key="del_symbol")
    if st.button("Delete"):
        if not d_symbol.strip():
            st.warning("Enter a symbol.")
        else:
            try:
                r = requests.delete(f"{st.session_state.base_url}/crypto/{d_symbol.strip()}", timeout=10)
                code, body = _handle_resp(r)
                st.write(f"Status: {code}")
                st.json(body)
            except requests.RequestException as e:
                st.error(str(e))
