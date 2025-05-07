import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Dropdown,
  Spinner,
  Input,
  Button, Alert,
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

  const { data: mapData, loading: loadingMap, error: errorMap } =
    useQuery<OrderMapData>(GET_ORDER_MAP_FIELDS)

  const { data: egoiData, loading: loadingEgoi, error: errorEgoi } =
    useQuery<EgoiStatusData>(GET_EGOI_ORDER_FIELDS)

  const [marketplaceMap, setMarketplaceMap] = useState<Mapping[]>([])
  const [fulfillmentMap, setFulfillmentMap] = useState<Mapping[]>([])
  const [saveLoading, setSaveLoading] = useState(false)

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

  const [goidiniSync] = useMutation(GOIDINI_ORDER_MAP_SYNC, {
    variables: {},
    onError: (e) => {
      setSaveLoading(false)
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' }) + e.message)
    },
    onCompleted: async () => {
      setSaveLoading(false)
      showSuccess(intl.formatMessage({ id: 'admin/egoi-admin.syncSuccess' }))
    }
  })

  // Mutation: bulk sync orders
  const [syncOrders, { loading: syncLoading }] = useMutation(
    GOIDINI_ORDER_SYNC_ORDER_BULK,
    {
      onError: e => {
        showError(
          intl.formatMessage({ id: 'admin/egoi-admin.syncOrdersError' }) +
          ' ' +
          e.message
        )
      },
      onCompleted: () => {
        showSuccess(
          intl.formatMessage({
            id: 'admin/egoi-admin.syncOrdersSuccess',
            defaultMessage: 'Sincronização de encomendas iniciada!',
          })
        )
      },
    }
  )

  useEffect(() => {
    if (mapData) {
      const fields = mapData.getGoidiniOrderMapFields ?? []
      setMarketplaceMap(
        fields.find(f => f.order_type === 'marketplace')?.mapping ?? []
      )
      setFulfillmentMap(
        fields.find(f => f.order_type === 'fulfillment')?.mapping ?? []
      )
    }
  }, [mapData])

  const egoiOptions = egoiData
    ? egoiData.getGoidiniEgoiOrderStatus.map(s => ({
      label: capitalize(s),
      value: s,
    }))
    : []

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
      arr.map(item => ({
        appStatus: item.appStatus,
        egoiStatus: item.egoiStatus,
      }))

    const payload = [
      { order_type: 'marketplace', mapping: toArray(marketplaceMap) },
      { order_type: 'fulfillment', mapping: toArray(fulfillmentMap) },
    ]

    goidiniSync({
      variables: {
        input: {
          payload, // <- Agora dentro de "input"
        },
      },
    })
  }

  const handleSyncOrders = () => {
    syncOrders({ variables: { input: true } })
  }




  const isLoading =
    loadingMap || loadingEgoi || marketplaceMap.length === 0 || fulfillmentMap.length === 0

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
        {(errorMap || errorEgoi) && (
          <PageBlock>
            <p>{(errorMap || errorEgoi)!.message}</p>
          </PageBlock>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'left', marginTop: 20 }}>
            <Spinner color="currentColor" size={20} />
          </div>
        ) : (
          <>
            {/* === Mapping Orders Card === */}
            <PageBlock variation="full">
              <p style={{ marginBottom: '24px' }}>
                <FormattedMessage
                  id="admin/egoi-admin.mappingDescription"
                  defaultMessage="Nesta secção pode mapear os estados das encomendas da sua loja com os estados reconhecidos pela E-goi."
                />
              </p>

              {/* === Marketplace === */}
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: 12 }}>
                  <FormattedMessage
                    id="admin/egoi-admin.marketplaceOrderTitle"
                    defaultMessage="Mapeamento dos Estados de Encomendas do Tipo Marketplace"
                  />
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
                      value={capitalize(m.appStatus)}
                      readOnly
                      style={{ width: '100%' }}
                    />
                    <Dropdown
                      id={`egoi-status-mp-${idx}`}
                      options={egoiOptions}
                      value={m.egoiStatus}
                      onChange={(e: any) =>
                        onChangeMarketplace(idx, e.target.value)
                      }
                      placeholder={intl.formatMessage({
                        id: 'admin/egoi-admin.selectEgoiStatus',
                        defaultMessage: 'Selecione o estado E-goi',
                      })}
                      disabled={egoiOptions.length === 0}
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
              </div>

              {/* === Fulfillment === */}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: 12 }}>
                  <FormattedMessage
                    id="admin/egoi-admin.fullfilmentOrderTitle"
                    defaultMessage="Mapeamento dos Estados de Encomendas do Tipo Fulfillment"
                  />
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
                      value={capitalize(m.appStatus)}
                      readOnly
                      style={{ width: '100%' }}
                    />
                    <Dropdown
                      id={`egoi-status-fu-${idx}`}
                      options={egoiOptions}
                      value={m.egoiStatus}
                      onChange={(e: any) =>
                        onChangeFulfillment(idx, e.target.value)
                      }
                      placeholder={intl.formatMessage({
                        id: 'admin/egoi-admin.selectEgoiStatus',
                        defaultMessage: 'Selecione o estado E-goi',
                      })}
                      disabled={egoiOptions.length === 0}
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
              </div>

              {/* === Botão Guardar === */}
              <div className="mt5">
              <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variation="secondary"
                  onClick={saveOrderFields}
                  isLoading={saveLoading}
                >
                  <FormattedMessage id="admin/egoi-admin.save" defaultMessage="Guardar" />
                </Button>
              </span>
              </div>
            </PageBlock>

            {/* === Orders Sync === */}
            <PageBlock variation="full">
              <p style={{ marginBottom: '24px' }}>
                <FormattedMessage
                  id="admin/egoi-admin.syncDescription"
                  defaultMessage="Nesta secção pode realizar o processo de sincronização total de encomendas. Este processo irá ser realizado em background."
                />
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '24px',
                }}
              >
              <span style={{ fontWeight: 500 }}>
                <FormattedMessage
                  id="admin/egoi-admin.syncNow"
                  defaultMessage="Sincronizar agora"
                />
              </span>
                <Button
                  variation="secondary"
                  onClick={handleSyncOrders}
                  isLoading={syncLoading}
                >
                  <FormattedMessage
                    id="admin/egoi-admin.sync"
                    defaultMessage="Sincronizar encomendas"
                  />
                </Button>
              </div>
            </PageBlock>
          </>
        )}
      </Layout>
    </>
  )
}

export default EcommerceTab
