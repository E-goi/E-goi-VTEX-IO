//react/adminExample.tsx
import React, {  useState } from 'react'
import {
  Layout,
  PageHeader,
  PageBlock,
  Alert,
  Dropdown,
  ButtonWithIcon,
  IconPlusLines,
  Spinner,
  Button,
  IconDelete } from 'vtex.styleguide'
import { useMutation, useQuery } from 'react-apollo'

import GET_EGOI_FIELDS from './graphql/getEgoiFields.graphql'
import GET_VTEX_FIELDS from './graphql/getVtexClientFields.graphql'
import GET_DATA_ENTITIES from './graphql/getDataEntities.graphql'
import GOIDINI_SYNC from './graphql/goidiniSync.graphql'
import GET_GOIDINI_MAP_FIELDS from './graphql/getGoidiniMapFields.graphql'

import { FormattedMessage, useIntl } from 'react-intl'

export interface Fields {
  value: string
  label: string
}

export interface DataEntityMap {
  dataEntity: string
  dataEntityLabel: string
  vtexField: string
  vtexFieldLabel: string
  egoiField: string
  egoiFieldLabel: string
}
export interface GoidiniMap {
    vtexField: String
    egoiField: String
    entity: String
}

// Data entities to ignore
const dataEntitiesToIgnore = [ 'AD', 'BK', 'OD', 'AU', 'BX', 'BB', 'GC', 'GT', 'BO', 'SB', 'MB', 'IL', 'IW', 'RD', 'SO', 'HL', 'IY' ]

// Data entities that have already mapped the base fields
const dataEntitiesBaseFields = [ 'CL', 'CO', 'NS', 'NL', 'NW', 'CF', 'FC', 'CT', 'NE', 'AS', 'BF' ] 

// Vtex base fields
const vtexBaseFields = [ 'createdIn','updatedIn','email','firstName','lastName','phone','businessPhone','homePhone']

const SyncContactsTab = () => {
  const intl = useIntl()
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Error')
  const [successMessage, setSuccessMessage] = useState('Success')

  const [saveLoading, setSaveLoading] = useState(false)
  const [active, setActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [dataEntities, setDataEntities] = useState<Array<Fields>>([])
  const [dataEntitiesSelected, setDataEntitiesSelected] = useState<Fields>({ value: '', label: '' })
  const [egoiFields, setEgoiFields] = useState<Array<Fields>>([])
  const [egoiFieldSelected, setEgoiFieldSelected] = useState<Fields>({ value: '', label: '' })
  const [vtexFields, setVtexFields] = useState<Array<Fields>>([])
  const [vtexFieldsSelected, setVtexFieldsSelected] = useState<Fields>({ value: '', label: '' })
  const [dataEntitiesMapped, setDataEntitiesMapped] = useState<Array<DataEntityMap>>([])
  const [vtexFieldsMapped, setVtexFieldsMapped] = useState<Array<Fields>>([])
  const [egoiFieldsMapped, setEgoiFieldsMapped] = useState<Array<Fields>>([])

  // Mapeia os campos para o select de campos E-goi
  const mapEgoiFieldsDropdown = () => {
    try {
      if (getEgoiFields.getEgoiFields.length === 0) {
        //exception
      } else {
        let egoiFieldsBase = [];

        // Se a entidade selecionada não for uma entidade default então apresentar os campos base e-goi
        if(!dataEntitiesBaseFields.includes(dataEntitiesSelected.value)){
          egoiFieldsBase = getEgoiFields.getEgoiFields.filter((obj: any) => {
            return obj.type === 'base'
          }).map((obj: { name: string; field_id: string; type: string }) => (
            { value: obj.field_id, label: obj.name }
          ));
        }

        // Obter os campos extra e-goi
        let egoiFieldsFilter = getEgoiFields.getEgoiFields.filter((obj: any) => { 
            return obj.type === 'extra' 
        })

        // mapear os campos para o tipo de dados que o select aceita
        let egoiFields = egoiFieldsFilter.length > 0 ?
          egoiFieldsFilter.map((obj: { name: string; field_id: string; type: string }) => (
            { value: 'extra_' + obj.field_id, label: obj.name }
          )) : []
        
        let egoiFieldsFinal = [...egoiFieldsBase, ...egoiFields]

        setEgoiFields(egoiFieldsFinal)
      }
    } catch (error) {
      console.log(error)
    } {
      setIsLoading(false)
    }
  }

  // Mapeia os campos para o select de campos Vtex
  const mapVtexClientFieldsDropdown = () => {
    try {
      if (getVtexClientFields.getVtexClientFields.fields === 0) {
        //exception
      } else {

        // Se a entidade selecionada não for uma entidade default então apresentar os campos base vtex (email, firstName, lastName, phone, businessPhone, homePhone)
        let vtexClientFields = getVtexClientFields.getVtexClientFields.fields
        .filter((obj: { name: string; displayName: string; type: string }) => {
            return (dataEntitiesBaseFields.includes(dataEntitiesSelected.value) && !vtexBaseFields.includes(obj.name)) || (!dataEntitiesBaseFields.includes(dataEntitiesSelected.value))       
        }).map((obj: { name: string; displayName: string; type: string }) => {
            return { value: obj.name, label: obj.displayName }
      })

        // Verifica se já existe um mapeamento para a dataEntity selecionada
        let vtexMappedFilter = dataEntitiesMapped.filter((obj: { dataEntity: string; vtexField: string; }) => { 
          return obj.dataEntity === dataEntitiesSelected.value 
        }).map((obj: { vtexField: string; }) => (
          obj.vtexField
        ))
        
        // Filtra os campos que já foram mapeados para a dataEntity selecionada
        setVtexFields(vtexClientFields.filter(((obj: any) => { return !vtexMappedFilter.includes(obj.value) })))
      }
    } catch (error) {
      console.log(error)
    } {
      setIsLoading(false)
    }
  }
  
  // Mapeia os campos para o select de entidades
  const mapDataEntitiesDropdown = () => {
    try {
      if (!getDataEntities || getDataEntities.getDataEntities.length === 0) {
        //exception
      } else {
        
        // Filtra as entidades
        let dataEntities = getDataEntities.getDataEntities
        .filter((obj: { acronym: string; name: string;}) => {
          return !dataEntitiesToIgnore.includes(obj.acronym)})
        .map((obj: { acronym: string; name: string;}) => {
            return { value: obj.acronym, label: obj.name + ' (' + obj.acronym + ')'}
      })

        setDataEntities(dataEntities)
      }
    } catch (error) {
      console.log(error)
    } {
      setIsLoading(false)
    }
  }

  // query para obter os campos e-goi. Em caso de erro mostra o erro e faz disable ao select
  const { data: getEgoiFields} = useQuery(GET_EGOI_FIELDS, {
    onCompleted: () =>  mapEgoiFieldsDropdown(),
    onError: (e) => {
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' }) + e.message) 
      setIsLoading(false)}
  })

  // query para obter os campos vtex para a entidade selecionada
  const {data: getVtexClientFields, refetch: refetchGetVtexFields }  = useQuery(GET_VTEX_FIELDS, {
    variables: {
      acronym: dataEntitiesSelected.value
    },
    onCompleted: () => {
      if(getVtexClientFields){
        mapVtexClientFieldsDropdown()
      }
    },
    onError: (e) => {
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' }) + e.message) 
      setActive(false)
      setIsLoading(false)}
  })

  // query para obter as entidades vtex
  const { data: getDataEntities } = useQuery(GET_DATA_ENTITIES, {
    onCompleted: mapDataEntitiesDropdown,
    onError: (e) => {
      showError(intl.formatMessage({ id: 'admin/egoi-admin.errorMapping' }) + e.message) 
      setActive(false)
      setIsLoading(false)}
  })

    // query para obter os campos já mapeados no Goidini
    const { data: goidiniMapFields } = useQuery(GET_GOIDINI_MAP_FIELDS, {
      skip: !dataEntitiesMapped,
      onCompleted: () => {

        if (goidiniMapFields.getGoidiniMapFields.status === 200 && goidiniMapFields.getGoidiniMapFields.message.length !== 0) {
          
          let dataEntitiesMapped = goidiniMapFields.getGoidiniMapFields.message.map((obj: GoidiniMap) => { 
            return { dataEntity: obj.entity, dataEntityLabel: obj.entity, egoiField: obj.egoiField, egoiFieldLabel: obj.egoiField, vtexField: obj.vtexField, vtexFieldLabel: obj.vtexField } 
          });

          setDataEntitiesMapped(dataEntitiesMapped)

          setIsLoading(false)
        }
      },
      onError: () => {
        setIsLoading(false)
      }
    })

  // mutation para guardar os campos e fazer o pedido ao goidini
  const [goidiniSync] = useMutation(GOIDINI_SYNC, {
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

  //função para adicionar um campo à lista de campos mapeados
  const addFields = () => {
    if( egoiFieldSelected.value && vtexFieldsSelected.value){
      let dataEntityMap = {
        dataEntity: dataEntitiesSelected.value,
        dataEntityLabel: dataEntitiesSelected.label,
        egoiField: egoiFieldSelected.value,
        egoiFieldLabel: egoiFieldSelected.label,
        vtexField: vtexFieldsSelected.value,
        vtexFieldLabel: vtexFieldsSelected.label
      }

      setDataEntitiesMapped([...dataEntitiesMapped, dataEntityMap])
      setEgoiFieldsMapped([...egoiFieldsMapped, egoiFieldSelected])
      setVtexFieldsMapped([...vtexFieldsMapped, vtexFieldsSelected])

      setEgoiFields(egoiFields.filter(field => field.value !== egoiFieldSelected.value))
      setVtexFields(vtexFields.filter(field => field.value !== vtexFieldsSelected.value))

    }
      setEgoiFieldSelected({ value: '', label: '' })
      setVtexFieldsSelected({ value: '', label: '' })
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
  }

  // função para guardar os campos mapeados
  const saveFields = () => {
    setSaveLoading(true)
    
    goidiniSync({
      variables: {
        vtex: [],
        egoi: [], 
        masterData: dataEntitiesMapped.map(x => { return { entity: x.dataEntity, egoiField: x.egoiField, vtexField: x.vtexField } })
      }
    })
  }

  // função para remover um campo da lista de campos mapeados e voltar a adicionar o campo ao select
  const removeFields = (idx: any) => {
    
    setDataEntitiesMapped(dataEntitiesMapped.filter(field => !(field.dataEntity == dataEntitiesMapped[idx].dataEntity && field.egoiField == dataEntitiesMapped[idx].egoiField && field.vtexField == dataEntitiesMapped[idx].vtexField)))

    if(dataEntitiesSelected){
      if(!egoiFields.map(x => x.value).includes(dataEntitiesMapped[idx].egoiField)){
        let obj = { value: dataEntitiesMapped[idx].egoiField, label: dataEntitiesMapped[idx].egoiFieldLabel }
        setEgoiFields([...egoiFields, obj])
      } 
    
      if(!vtexFields.map(x => x.value).includes(dataEntitiesMapped[idx].vtexField)){
        let obj = { value: dataEntitiesMapped[idx].vtexField, label: dataEntitiesMapped[idx].vtexFieldLabel }
        setVtexFields([...vtexFields, obj])
      }
    }
    
  }

  const handleDataEntitiesChange = async (e: any) => {
      let obj = dataEntities.find(x => x.value === e.target.value)
      if (obj) {
        setDataEntitiesSelected(obj)
        refetchGetVtexFields()

        let egoiFieldsBase = [];

        if(!dataEntitiesBaseFields.includes(obj.value)){
          egoiFieldsBase = getEgoiFields.getEgoiFields.filter((obj: any) => {
            return obj.type === 'base'
          }).map((obj: { name: string; field_id: string; type: string }) => (
            { value: obj.field_id, label: obj.name }
          ));
        }

        let egoiFieldsFilter = getEgoiFields.getEgoiFields.filter((obj: any) => { 
            return obj.type === 'extra' 
        })

        let egoiFields = egoiFieldsFilter.length > 0 ?
          egoiFieldsFilter.map((obj: { name: string; field_id: string; type: string }) => (
            { value: 'extra_' + obj.field_id, label: obj.name }
          )) : []
        
        let egoiFieldsFinal = [...egoiFieldsBase, ...egoiFields]

        let egoiFieldsMappedFilter = dataEntitiesMapped.filter((d: { dataEntity: string; egoiField: string; }) => { return d.dataEntity === obj?.value }).map((obj: { egoiField: string; }) => (
          obj.egoiField
        ))

        setEgoiFields(egoiFieldsFinal.filter(((obj: any) => { return !egoiFieldsMappedFilter.includes(obj.value) })))
      }
  };

  const handleEgoiFieldsChange = async (e: any) => {
      let obj = egoiFields.find(x => x.value === e.target.value)
      if (obj) {
        setEgoiFieldSelected(obj)
      }
  };

  const handleVtexFieldsChange = async (e: any) => {
      let obj = vtexFields.find(x => x.value === e.target.value)
      if (obj) {
        setVtexFieldsSelected(obj)
      }
  };

  return (
    <>
      {
        showErrorAlert ?
          <Alert type="error" onClose={() => setShowErrorAlert(false)}>
            {errorMessage}
          </Alert>
          :
          <></>
      }
      {
        showSuccessAlert ?
          <Alert type="success" onClose={() => setShowSuccessAlert(false)}>
            {successMessage}
          </Alert>
          :
          <></>
      }
      <Layout pageHeader={<PageHeader title="E-goi" />}>
        <PageBlock
          subtitle={<FormattedMessage id="admin/egoi-admin.configSync" />}
          variation="full">

          {
            isLoading ?
              <Spinner color="currentColor" size={20} />
              :
              active ?
              <div>
                <div>
                  <div>
                    <p><FormattedMessage id="admin/egoi-admin.syncFieldsText" /></p>
                  </div>

                  <div style={{ display: 'flex' }}>
                  <div style={{
                      width: "70%",
                      margin: "20px"
                    }}>
                      <Dropdown
                        label={ intl.formatMessage({id: 'admin/egoi-admin.dataEntities'})}
                        options={dataEntities}
                        value={dataEntitiesSelected.value}
                        onChange={(e: any) => handleDataEntitiesChange(e)}
                      />
                      {dataEntitiesMapped.map(field => <p className="pa3 br2 bg-muted-5 hover-bg-muted-5 active-bg-muted-5 c-on-muted-5 hover-c-on-muted-5 active-c-on-muted-5 mr3" style={{ 'minHeight': '2rem', 'display': 'table' }}>{field.dataEntityLabel}</p>)}
                    </div>
                    
                    <div style={{
                      width: "70%",
                      margin: "20px"
                    }}>
                      <Dropdown
                        label={intl.formatMessage({id: 'admin/egoi-admin.vtexFields'}) }
                        disabled={( dataEntitiesSelected.value == '' )} 
                        options={vtexFields}
                        value={ vtexFieldsSelected.value}
                        onChange={(e: any) => handleVtexFieldsChange(e)}
                      />
                      {dataEntitiesMapped.map(field => <p className="pa3 br2 bg-muted-5 hover-bg-muted-5 active-bg-muted-5 c-on-muted-5 hover-c-on-muted-5 active-c-on-muted-5 mr3" style={{ 'minHeight': '2rem', 'display': 'table' }}>{field.vtexFieldLabel}</p>)}
                    </div>
                    <div style={{
                      width: "70%",
                      margin: "20px"
                    }}>
                      <Dropdown
                        label={intl.formatMessage({id: 'admin/egoi-admin.egoiFields'})}
                        disabled={( dataEntitiesSelected.value == '' )} 
                        options={egoiFields}
                        value={egoiFieldSelected.value}
                        onChange={(e: any) => handleEgoiFieldsChange(e)}
                      />
                      {dataEntitiesMapped.map(field => <p className="pa3 br2 bg-muted-5 hover-bg-muted-5 active-bg-muted-5 c-on-muted-5 hover-c-on-muted-5 active-c-on-muted-5 mr3" style={{ 'minHeight': '2rem', 'display': 'table' }}>{field.egoiFieldLabel}</p>)}
                    </div>
                    <div style={{ height: "10%", margin: "43px 0px 0px 0px" }}>
                      <ButtonWithIcon icon={<IconPlusLines />} variation="secondary" onClick={addFields} disabled={(egoiFields.length == 0 || vtexFields.length == 0)} />

                      {dataEntitiesMapped.map((_, idx) => <p>
                        <ButtonWithIcon
                          onClick={() => removeFields(idx)}
                          icon={<IconDelete />}
                          size="small"
                          variation="danger" />
                      </p>)}

                    </div>
                  </div>

                  <div style={{ padding: '20px', color: '#8a6d3b', background: '#fcf8e3' }}>
                    <p><FormattedMessage id="admin/egoi-admin.syncDefaultFieldsText" /></p>
                  </div>
                </div>
                <div className="mt5">
                  <span style={{ display: 'flex', justifyContent: 'flex-end', columnGap: '20px' }}>
                    <Button variation="secondary"
                      onClick={saveFields}
                      isLoading={saveLoading}> <FormattedMessage id="admin/egoi-admin.save" /></Button>
                  </span>
                </div>
              </div>
              :
              <div>
                <p><FormattedMessage id="admin/egoi-admin.configNeed" /></p>
              </div>
          }

        </PageBlock>
      </Layout>
    </>
  )
}

export default SyncContactsTab