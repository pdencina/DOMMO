import {
  WebpayPlus,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
  Environment,
  Options,
} from 'transbank-sdk'

const isProduction = process.env.TRANSBANK_ENVIRONMENT === 'production'

const options = isProduction
  ? new Options(
      process.env.TRANSBANK_COMMERCE_CODE!,
      process.env.TRANSBANK_API_KEY!,
      Environment.Production
    )
  : new Options(
      IntegrationCommerceCodes.WEBPAY_PLUS,
      IntegrationApiKeys.WEBPAY,           // ← 'WEBPAY' no 'WEBPAY_PLUS'
      Environment.Integration
    )

export const webpayTransaction = new WebpayPlus.Transaction(options)
export const isIntegration = !isProduction
