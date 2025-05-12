import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Dropdown,
  Spinner,
  Input,
  Button,
  Alert,
} from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'

import GET_ORDER_MAP_FIELDS from './graphql/getGoidiniOrderMapFields.graphql'
import GET_EGOI_ORDER_FIELDS from './graphql/getGoidiniEgoiOrderStatus.graphql'
import GOIDINI_ORDER_MAP_SYNC from './graphql/goidiniOrderMapSync.graphql'
import GOIDINI_ORDER_SYNC_ORDER_BULK from './graphql/goidiniOrderSyncBulk.graphql'

interface Mapping {
  appStatus: string
  egoiStatus: string
}
interface OrderMapField {
  order_type: 'fulfillment' | 'marketplace'
  mapping: Mapping[]
}
interface OrderMapData {
  getGoidiniOrderMapFields: OrderMapField[]
}
interface EgoiStatusData {
  getGoidiniEgoiOrderStatus: string[]
}

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

const EcommerceTab: React.FC = () => {
  const intl = useIntl()
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')

  const [marketplaceMap, setMarketplaceMap] = useState<Mapping[]>([])
  const [fulfillmentMap, setFulfillmentMap] = useState<Mapping[]>([])
  const [egoiOptions, setEgoiOptions] = useState<
    Array<{ label: string; value: string }>
  >([])

  const [saveLoading, setSaveLoading] = useState(false)
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 5000)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
    setTimeout(() => setShowErrorAlert(false), 5000)
  }

  // Query de mapeamento: ignorar erros de GraphQL (ex: .map is not a function)
  useQuery<OrderMapData>(GET_ORDER_MAP_FIELDS, {
    errorPolicy: 'ignore',
    onCompleted: (data) => {
      if (data && Array.isArray(data.getGoidiniOrderMapFields)) {
        const fields = data.getGoidiniOrderMapFields

        const marketplace =
          fields.find((f) => f.order_type === 'marketplace')?.mapping ?? []

        const fulfillment =
          fields.find((f) => f.order_type === 'fulfillment')?.mapping ?? []

        setMarketplaceMap(marketplace)
        setFulfillmentMap(fulfillment)
        setActive(marketplace.length > 0 || fulfillment.length > 0)
      } else {
        setMarketplaceMap([])
        setFulfillmentMap([])
        setActive(false)
      }

      setLoading(false)
    },
    onError: () => {
      // ao falhar, considera não configurado
      setActive(false)
      setLoading(false)
    },
  })

  const { error: errorEgoi } = useQuery<EgoiStatusData>(GET_EGOI_ORDER_FIELDS, {
    onCompleted: (data) => {
      if (data && Array.isArray(data.getGoidiniEgoiOrderStatus)) {
        setEgoiOptions(
          data.getGoidiniEgoiOrderStatus.map((s) => ({
            label: capitalize(s),
            value: s,
          }))
        )
      } else {
        setEgoiOptions([])
      }
    },
    onError: () => setEgoiOptions([]),
  })

  const [goidiniSync] = useMutation(GOIDINI_ORDER_MAP_SYNC, {
    onError: (e) => {
      setSaveLoading(false)
      showError(
        intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' }) + e.message
      )
    },
    onCompleted: () => {
      setSaveLoading(false)
      showSuccess(intl.formatMessage({ id: 'admin/egoi-admin.syncSuccess' }))
    },
  })

  const [syncOrders, { loading: syncLoading }] = useMutation(
    GOIDINI_ORDER_SYNC_ORDER_BULK,
    {
      onError: (e) => {
        showError(
          `${intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' })} ${
            e.message
          }`
        )
      },
      onCompleted: (res) => {
        const result = res?.goidiniOrderSyncBulk

        if (!result || result.status !== 200) {
          showError(
            `${intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' })} ${
              result?.message
            }`
          )

          return
        }

        showSuccess(intl.formatMessage({ id: 'admin/egoi-admin.syncSuccess' }))
      },
    }
  )

  const onChangeMarketplace = (idx: number, value: string) => {
    const updated = [...marketplaceMap]

    updated[idx] = { ...updated[idx], egoiStatus: value }
    setMarketplaceMap(updated)
  }

  const onChangeFulfillment = (idx: number, value: string) => {
    const updated = [...fulfillmentMap]

    updated[idx] = { ...updated[idx], egoiStatus: value }
    setFulfillmentMap(updated)
  }

  const saveOrderFields = () => {
    setSaveLoading(true)
    const toArray = (arr: Mapping[]) =>
      arr.map((item) => ({
        appStatus: item.appStatus,
        egoiStatus: item.egoiStatus,
      }))

    const payload = [
      { order_type: 'marketplace', mapping: toArray(marketplaceMap) },
      { order_type: 'fulfillment', mapping: toArray(fulfillmentMap) },
    ]

    goidiniSync({ variables: { input: { payload } } })
  }

  const handleSyncOrders = () => {
    syncOrders({ variables: { input: true } })
  }

  // exibir erro apenas do E-goi
  const combinedError = errorEgoi

  return (
    <>
      {showErrorAlert && (
        <Alert type="error" onClose={() => setShowErrorAlert(false)}>
          {errorMessage}
        </Alert>
      )}
      {showSuccessAlert && (
        <Alert type="success" onClose={() => setShowSuccessAlert(false)}>
          {successMessage}
        </Alert>
      )}

      <Layout
        pageHeader={
          <PageHeader
            title={intl.formatMessage({
              id: 'admin/egoi-admin.navigation.ecommerce',
              defaultMessage: 'E-goi',
            })}
          />
        }
      >
        {combinedError ? (
          <PageBlock>
            <p>{combinedError.message}</p>
          </PageBlock>
        ) : loading ? (
          <div
            style={{ display: 'flex', justifyContent: 'left', marginTop: 20 }}
          >
            <Spinner color="currentColor" size={20} />
          </div>
        ) : active ? (
          <>
            <PageBlock variation="full">
              <p style={{ marginBottom: '24px' }}>
                <FormattedMessage id="admin/egoi-admin.mappingDescription" />
              </p>

              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: 12 }}>
                  <FormattedMessage id="admin/egoi-admin.marketplaceOrderTitle" />
                </p>
                {marketplaceMap.map((m, idx) => (
                  <div
                    key={`mp-${idx}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                      marginBottom: 12,
                    }}
                  >
                    <Input
                      label={
                        idx === 0
                          ? intl.formatMessage({
                              id: 'admin/egoi-admin.vtexFields',
                            })
                          : ''
                      }
                      value={capitalize(m.appStatus)}
                      readOnly
                      style={{ width: '100%' }}
                    />
                    <Dropdown
                      label={
                        idx === 0
                          ? intl.formatMessage({
                              id: 'admin/egoi-admin.egoiFields',
                            })
                          : ''
                      }
                      id={`egoi-status-mp-${idx}`}
                      options={egoiOptions}
                      value={m.egoiStatus}
                      onChange={(e: any) =>
                        onChangeMarketplace(idx, e.target.value)
                      }
                      placeholder={intl.formatMessage({
                        id: 'admin/egoi-admin.selectEgoiStatus',
                      })}
                      disabled={egoiOptions.length === 0}
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 'bold', marginBottom: 12 }}>
                  <FormattedMessage id="admin/egoi-admin.fullfilmentOrderTitle" />
                </p>
                {fulfillmentMap.map((m, idx) => (
                  <div
                    key={`fu-${idx}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                      marginBottom: 12,
                    }}
                  >
                    <Input
                      label={
                        idx === 0
                          ? intl.formatMessage({
                              id: 'admin/egoi-admin.vtexFields',
                            })
                          : ''
                      }
                      value={capitalize(m.appStatus)}
                      readOnly
                      style={{ width: '100%' }}
                    />
                    <Dropdown
                      label={
                        idx === 0
                          ? intl.formatMessage({
                              id: 'admin/egoi-admin.egoiFields',
                            })
                          : ''
                      }
                      id={`egoi-status-fu-${idx}`}
                      options={egoiOptions}
                      value={m.egoiStatus}
                      onChange={(e: any) =>
                        onChangeFulfillment(idx, e.target.value)
                      }
                      placeholder={intl.formatMessage({
                        id: 'admin/egoi-admin.selectEgoiStatus',
                      })}
                      disabled={egoiOptions.length === 0}
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt5">
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variation="secondary"
                    onClick={saveOrderFields}
                    isLoading={saveLoading}
                  >
                    <FormattedMessage id="admin/egoi-admin.save" />
                  </Button>
                </span>
              </div>
            </PageBlock>

            <PageBlock variation="full">
              <p style={{ marginBottom: '24px' }}>
                <FormattedMessage id="admin/egoi-admin.syncDescription" />
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '24px',
                }}
              >
                <Button
                  variation="secondary"
                  onClick={handleSyncOrders}
                  isLoading={syncLoading}
                >
                  <FormattedMessage id="admin/egoi-admin.sync" />
                </Button>
              </div>
            </PageBlock>
          </>
        ) : (
          <PageBlock>
            <p>
              <FormattedMessage id="admin/egoi-admin.configNeed" />
            </p>
          </PageBlock>
        )}
      </Layout>
    </>
  )
}

export default EcommerceTab
