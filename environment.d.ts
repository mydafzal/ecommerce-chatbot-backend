declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      WOOCOMMERCE_CONSUMER_KEY: string;
      WOOCOMMERCE_CONSUMER_SECRET: string;
      REDIS_PORT: number;
      REDIS_PASSWORD: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
