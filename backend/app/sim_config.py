import os

TICK_SPEED = 0.5
HISTORY_LIMIT = 500

MU = 0.00005
SIGMA = 0.005
ORDER_BOOK_DEPTH = 6
FUNDAMENTAL_WEIGHT = 0.000015

SIGMA0 = 0.004
DF_T = 6
GARCH_W = 1e-7
GARCH_A = 0.06
GARCH_B = 0.92
JUMP_LAMBDA = 0.002
JUMP_MU = 0.0
JUMP_SIGMA = 0.02
THETA_F = 0.002
FUND_DRIFT = 0.0
FUND_VOL = 0.0005
DEPTH_DECAY = 0.65
VOL_TO_SPREAD = 2.5
OFI_IMPACT = 0.03
LEVEL_SPACING_FACTOR = 0.6
COMMON_RHO = 0.45
SENTI_PERSIST = 0.98
SENTI_SHOCK = 1e-4
MARKET_SENTI_PERSIST = 0.995
MARKET_SENTI_SHOCK = 5e-5
SENTI_CLIP = 0.02
SEASONAL_AMP = 0.07

STABLECOIN_TOKENS = ("USDT", "USDC", "DAI", "TUSD", "FDUSD", "USDP")

GRANULARITY_LEVELS = ["1s", "5s", "1m", "30m", "1h", "90m", "1d", "5d", "1wk", "1mo", "3mo", "6mo", "1y", "5y", "10y"]


class DBSchema:
    """
    Database Schema
    """
    def __init__(self):
        self.CRYPTO_EXCHANGE = "cryptoexchange"

class Config:
    """
    Uniform Configs
    """
    def __init__(self):
        self.SUPABASE_URL = os.getenv("SUPABASE_URL")
        self.SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
        self.DB_SCHEMA = DBSchema()
        self.LOGGER = 'uvicorn.error'

class DevConfig(Config):
    """
    Development Configs
    """
    DEBUG = True
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()

        super().__init__()

class ProdConfig(Config):
    """
    Production Configs
    """
    DEBUG = False


# Setup API Config
if os.getenv("ENV") == "PROD":
    config = ProdConfig()
else:
    config = DevConfig()