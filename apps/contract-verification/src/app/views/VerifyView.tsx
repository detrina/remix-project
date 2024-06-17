import React, {useEffect, useState} from 'react'

import {AppContext} from '../AppContext'
import {SearchableDropdown} from '../components'
import {ContractDropdown} from '../components/ContractDropdown'
// INSERT_YOUR_CODE
import {ethers} from 'ethers/'
import {Chain} from '../types/VerificationTypes'

export const VerifyView = () => {
  const {chains, compilationOutput, verifiers, setVerifiers, selectedContractFileAndName} = React.useContext(AppContext)
  const [contractAddress, setContractAddress] = useState('')
  const [contractAddressError, setContractAddressError] = useState('')
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>()

  useEffect(() => {
    console.log('Selected chain changed', selectedChain)
  }, [selectedChain])

  const ethereumChainIds = [1, 3, 4, 5, 11155111, 17000]

  // Add Ethereum chains to the head of the chains list. Sort the rest alphabetically
  const dropdownChains = chains.sort((a, b) => {
    const isAInEthereum = ethereumChainIds.includes(a.chainId)
    const isBInEthereum = ethereumChainIds.includes(b.chainId)

    if (isAInEthereum && !isBInEthereum) return -1
    if (!isAInEthereum && isBInEthereum) return 1
    if (isAInEthereum && isBInEthereum) return ethereumChainIds.indexOf(a.chainId) - ethereumChainIds.indexOf(b.chainId)

    return (a.title || a.name).localeCompare(b.title || b.name)
  })

  const handleVerify = async (e) => {
    e.preventDefault() // Don't change the page
    const sourcifyPromises = verifiers.map((verifier) => {
      return verifier.verify(selectedChain.chainId.toString(), contractAddress, compilationOutput, selectedContractFileAndName)
    })

    const results = await Promise.all(sourcifyPromises)
    console.log('results', results)
  }

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isValidAddress = ethers.utils.isAddress(event.target.value)
    setContractAddress(event.target.value)
    if (!isValidAddress) {
      setContractAddressError('Invalid contract address')
      console.error('Invalid contract address')
      return
    }
    setContractAddressError('')
  }

  console.log('sourcifyVerifiers:', verifiers)

  return (
    <div className="my-4">
      <div>
        <h2 className="text-center text-uppercase font-weight-bold">Verify</h2>
        <p className="text-center" style={{fontSize: '0.8rem'}}>
          Verify compiled contracts on different verification services
        </p>
      </div>
      <form onSubmit={handleVerify}>
        <SearchableDropdown label="Contract Chain" chains={dropdownChains} id="network-dropdown" setSelectedChain={setSelectedChain} selectedChain={selectedChain} />

        <div className="form-group">
          <label htmlFor="contract-address">Contract Address</label>
          <div>{contractAddressError && <div className="text-danger">{contractAddressError}</div>}</div>
          <input type="text" className="form-control" id="contract-address" placeholder="0x2738d13E81e..." value={contractAddress} onChange={handleAddressChange} />
        </div>

        <ContractDropdown label="Contract Name" id="contract-dropdown-1" />

        <button type="submit" className="btn btn-primary">
          {' '}
          Verify{' '}
        </button>

        <div>
          {verifiers?.length > 0 &&
            verifiers.map((verifier) => (
              <div key={verifier.name} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`verifier-${verifier.name}`}
                  checked={verifier.enabled}
                  onChange={(e) => {
                    verifier.enabled = e.target.checked
                    // Trigger a re-render or state update if necessary
                    // For example, you might need to update the state that holds the verifiers
                    setVerifiers([...verifiers])
                  }}
                />
                <label className="form-check-label" htmlFor={`verifier-${verifier.name}`}>
                  {verifier.name} ({verifier.apiUrl})
                </label>
              </div>
            ))}
        </div>
      </form>
    </div>
  )
}
