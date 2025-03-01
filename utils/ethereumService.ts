// ethereumService.ts
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '@/const/value';
import { abi } from '@/const/contract-abi';

class EthereumService {
    private static instance: EthereumService;
    public provider: ethers.providers.Web3Provider | null = null;
    public signer: ethers.Signer | null = null;
    public contract: ethers.Contract | null = null;
    private ethereum: any = null;

    private constructor() { }

    public static getInstance(): EthereumService {
        if (!EthereumService.instance) {
            EthereumService.instance = new EthereumService();
        }
        return EthereumService.instance;
    }

    /**
     * Initializes the Ethereum provider, signer, and contract.
     * Must be executed on the client side.
     */
    public async initialize() {
        if (typeof window !== 'undefined') {
            try {
                this.ethereum = await detectEthereumProvider();

                if (this.ethereum) {
                    // Use the detected ethereum provider
                    this.provider = new ethers.providers.Web3Provider(this.ethereum);

                    // Check if accounts are already connected
                    const accounts = await this.provider.listAccounts();

                    if (accounts.length === 0) {
                        // Request account access to prompt wallet connection
                        await this.ethereum.request({ method: 'eth_requestAccounts' });
                    }

                    this.signer = this.provider.getSigner();
                    // Initialize the contract with signer
                    this.contract = new ethers.Contract(CONTRACT_ADDRESS, abi, this.signer);

                    // Add event listeners
                    this.ethereum.on('accountsChanged', this.handleAccountsChanged);
                    this.ethereum.on('chainChanged', this.handleChainChanged);
                    this.ethereum.on('disconnect', this.handleDisconnect);

                    console.log('Ethereum service initialized');
                } else {
                    // No ethereum provider detected
                    console.error('Please install MetaMask to use this application!');
                    throw new Error('MetaMask not installed');
                }
            } catch (error) {
                console.error('Failed to initialize Ethereum provider:', error);
                throw error;
            }
        } else {
            // Not in a browser environment
            console.error('This application must be used in a browser environment.');
            throw new Error('Not in browser environment');
        }
    }

    private handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            console.error('Please connect to an Ethereum account.');
            // Optionally, reset the signer and contract
            this.signer = null;
            this.contract = null;
        } else {
            // Re-initialize signer and contract with the new account
            this.signer = this.provider!.getSigner();
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, abi, this.signer);
        }
    };

    private handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId);
        // Reload the page to ensure that the network change is applied
        window.location.reload();
    };

    private handleDisconnect = (error: { code: number; message: string }) => {
        console.error('Disconnected from Ethereum provider:', error);
        // Optionally, reset the provider, signer, and contract
        this.provider = null;
        this.signer = null;
        this.contract = null;
    };
}

export const ethereumService = EthereumService.getInstance();
