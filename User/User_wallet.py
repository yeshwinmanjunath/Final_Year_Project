from Crypto.PublicKey import RSA

def generate_and_store_keys():
    key=RSA.generate(2048)

    f=open('private_key.pem','wb')
    f.write(key.exportKey('PEM').decode('ascii'))
    f.close

    f=open('public_key.pem','wb')
    f.write(key.publickey().exportKey('PEM').decode('ascii'))
    f.close

def load_keys():
    key=RSA.importKey(open("private_key.pem",'rb'))
    print key.exportKey()
    print key.publickey().exportKey()

def add_balance():
    #external gateway to be made here
    implemented="False"             #function not implemented yet

generate_and_store_keys()
load_keys()