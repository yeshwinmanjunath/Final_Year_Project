import pickle

class User:
    def __init__(self,name,age):
        self.name=name
        self.age=age
        #other details
   
    def show_user_details(self):
        print self.name
        print self.age
        #other details


def create_user():
    name=raw_input("Name: ")
    age=int(input("Age: "))
    #other details
    return User(name,age)

def store_user(user):
    f=open('User.obj','w')
    pickle.dump(user,f)
    f.close()

def load_user():
    f=open('User.obj','r')
    return pickle.load(f)


user=create_user()
user.show_user_details()

store_user(user)
print "User stored."

new1=load_user()
print "User loaded: "
new1.show_user_details()