import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Toggle,
  Input,
  Spinner,
  Alert,
  Dropdown,
  Button,
} from 'vtex.styleguide'

import GET_APP_SETTINGS from './graphql/appSettings.graphql'
import SAVE_APP_SETTINGS from './graphql/saveAppSettings.graphql'
import CREATE_CONNECTED_SITES from './graphql/createConnectedSites.graphql'
import GET_HOST from './graphql/hostName.graphql'
import { FormattedMessage, useIntl } from 'react-intl'

interface Option {
  value: string
  label: string
}

const ConnectedSitesTab = () => {
  const intl = useIntl()
  const [connectedSites, setConnectedSites] = useState(false)
  const [domains, setDomains] = useState<Option[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(true)

  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [updateConnectedSites] = useMutation(CREATE_CONNECTED_SITES)

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
  }
  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  // Queries
  const { data: appSettings } = useQuery(GET_APP_SETTINGS, {
    onCompleted: () => {
      const settings = appSettings?.getAppSettings || {}
      setActive(!!settings.apikey)
      setConnectedSites(!!settings.connectedSites)
      setLoading(false)
    },
    onError: () => {
      setActive(false)
      setLoading(false)
    },
  })
  useQuery(GET_HOST, {
    ssr: false,
    onCompleted: data => {
      const hosts: string[] = data?.hostName?.hosts || []
      const opts = hosts.map(h => ({ value: h, label: h }))
      setDomains(opts)
      const saved = appSettings?.getAppSettings?.domain
      const valid = opts.find(o => o.value === saved)
      setSelectedDomain(valid ? saved! : opts[0]?.value || '')
      setLoading(false)
    },
    onError: () => {
      setLoading(false)
      showError(intl.formatMessage({ id: 'admin/egoi-admin.csErrorStore' }))
    },
  })

  // Mutations: saveAppSettings loading only
  const [saveAppSettings, { loading: savingSettings }] = useMutation(
    SAVE_APP_SETTINGS,
    {
      refetchQueries: [{ query: GET_APP_SETTINGS }],
      awaitRefetchQueries: true,
      onError: () => showError(intl.formatMessage({ id: 'admin/egoi-admin.csError' })),
    }
  )
  const [createConnectedSites] = useMutation(
    CREATE_CONNECTED_SITES,
    {
      onError: e =>
        showError(
          intl.formatMessage({ id: 'admin/egoi-admin.csErrorCreate' }) + e.message
        ),
      onCompleted: resp => {
        if (resp.createConnectedSites.status === 200) {
          showSuccess(intl.formatMessage({ id: 'admin/egoi-admin.csSuccess' }))
        } else {
          showError(
            intl.formatMessage({ id: 'admin/egoi-admin.csErrorCreate' }) +
            resp.createConnectedSites.message
          )
          setConnectedSites(false)
        }
      },
    }
  )

  // Handlers
  const handleDomainChange = (_: any, value: string) => {
    setSelectedDomain(value)
  }

  const saveSelectedDomain = async () => {
    try {
      await saveAppSettings({
        variables: {
          domain: selectedDomain,
          pixelActive: connectedSites,
          connectedSites: true,
        },
      })
      showSuccess(intl.formatMessage({ id: 'admin/egoi-admin.csSuccess' }))
      updateConnectedSites()
    } catch (err) {
      showError(
        intl.formatMessage({ id: 'admin/egoi-admin.csError' }) + String(err)
      )
    }
  }

  const saveSettings = async (flag: boolean) => {
    try {
      if (!appSettings?.getAppSettings.connectedSites) {
        // Dispara em background
        createConnectedSites({ variables: {} })
      } else {
        await saveAppSettings({
          variables: {
            pixelActive: flag,
            connectedSites: appSettings.getAppSettings.connectedSites,
          },
        })
        showSuccess(intl.formatMessage({ id: 'admin/egoi-admin.csSuccess' }))
      }
    } catch (err) {
      showError(
        intl.formatMessage({ id: 'admin/egoi-admin.csErrorActivate' }) +
        String(err)
      )
    }
  }

  const settings = appSettings?.getAppSettings || {}

  // Render
  return (
    <>
      {showErrorAlert && (
        <Alert
          type="error"
          autoClose={2000}
          onClose={() => setShowErrorAlert(false)}
        >
          {errorMessage}
        </Alert>
      )}
      {showSuccessAlert && (
        <Alert
          type="success"
          autoClose={2000}
          onClose={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </Alert>
      )}

      <Layout pageHeader={<PageHeader title="E-goi" />}>
        <PageBlock
          subtitle={<FormattedMessage id="admin/egoi-admin.configConnectedSites" />}
          variation="full"
        >
          {loading ? (
            <Spinner size={20} color="currentColor" />
          ) : active ? (
            <>
              <p>
                <FormattedMessage id="admin/egoi-admin.csText1" />
              </p>
              <p>
                <FormattedMessage id="admin/egoi-admin.csText2" />
              </p>
              <span>
                <FormattedMessage id="admin/egoi-admin.csText3" />{' '}
                <a
                  target="_blank"
                  href="https://helpdesk.e-goi.com/262312-Connected-Sites-What-is-it-and-how-do-I-use-it"
                >
                  <FormattedMessage id="admin/egoi-admin.csHere" />
                </a>
              </span>

              <section className="mt8">
                <h4 className="t-heading-5 mt0">
                  <FormattedMessage id="admin/egoi-admin.activateConnectedSites" />
                </h4>
                <Toggle
                  semantic
                  checked={connectedSites}
                  onChange={() => {
                    saveSettings(!connectedSites)
                    setConnectedSites(!connectedSites)
                  }}
                  label={
                    connectedSites ? (
                      <FormattedMessage id="admin/egoi-admin.activated" />
                    ) : (
                      <FormattedMessage id="admin/egoi-admin.deactivated" />
                    )
                  }
                />
              </section>

              {connectedSites && (
                <section className="mt8">
                  <h4 className="t-heading-5 mt0">
                    <FormattedMessage id="admin/egoi-admin.domain" />
                  </h4>
                  {domains.length === 1 ? (
                    <Input
                      label={<FormattedMessage id="admin/egoi-admin.domainLabel" />}
                      readOnly
                      value={domains[0].label}
                    />
                  ) : (
                    <>
                      <Dropdown
                        label={intl.formatMessage({ id: 'admin/egoi-admin.domainLabel' })}
                        options={domains}
                        value={selectedDomain}
                        onChange={handleDomainChange}
                        placeholder={intl.formatMessage({ id: 'admin/egoi-admin.domainLabel' })}
                      />
                      <div className="mt4 flex justify-end">
                        <Button
                          variation="secondary"
                          onClick={saveSelectedDomain}
                          isLoading={savingSettings}
                          disabled={savingSettings}
                        >
                          <FormattedMessage id="admin/egoi-admin.save" />
                        </Button>
                      </div>
                    </>
                  )}
                </section>
              )}
            </>
          ) : (
            <p>
              <FormattedMessage id="admin/egoi-admin.configNeed" />
            </p>
          )}
        </PageBlock>

        {connectedSites && (
          <PageBlock
            subtitle={<FormattedMessage id="admin/egoi-admin.abandonedCart" />}
            variation="full"
          >
            {!loading && active && (
              <Input
                readOnly
                label={<FormattedMessage id="admin/egoi-admin.abandonedCartLabel" />}
                value={`var d=document,g=d.createElement(\"script\"),s=d.getElementsByTagName(\"script\")[0];g.async=!0,g.src=\"https://cdn-te.e-goi.com/tng/vtex-te.min.js\",g.setAttribute(\"client_id\",\"${settings.clientId}\"),g.setAttribute(\"list_id\",\"${settings.listId}\"),s.parentNode.insertBefore(g,s);`}
              />
            )}
          </PageBlock>
        )}
      </Layout>
    </>
  )
}

export default ConnectedSitesTab
