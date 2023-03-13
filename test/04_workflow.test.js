const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

describe('User workflow tests', () => {

    it('should register + login a user, create product and verify 1 in DB', (done) => {

        // 1) Register new user
        let user = {
            name: "Peter Petersen",
            email: "mail@petersen.com",
            password: "123456"
        }
        chai.request(server)
            .post('/api/user/register')
            .send(user)
            .end((err, res) => {
                
                // Asserts
                expect(res.status).to.be.equal(200);   
                expect(res.body).to.be.a('object');
                expect(res.body.error).to.be.equal(null);
               
                // 2) Login the user
                chai.request(server)
                    .post('/api/user/login')
                    .send({
                        "email": "mail@petersen.com",
                        "password": "123456"
                    })
                    .end((err, res) => {
                        // Asserts                        
                        expect(res.status).to.be.equal(200);
                        expect(res.body.error).to.be.equal(null);                        
                        let token = res.body.data.token;

                        // 3) Create new product
                        let product =
                        {
                            name: "Test Product",
                            description: "Test Product Description",
                            price: 100,
                            inStock: true
                        };

                        chai.request(server)
                            .post('/api/products')
                            .set({ "auth-token": token })
                            .send(product)
                            .end((err, res) => {
                                
                                // Asserts
                                expect(res.status).to.be.equal(201);                                
                                expect(res.body).to.be.a('array');
                                expect(res.body.length).to.be.eql(1);
                                
                                let savedProduct = res.body[0];
                                expect(savedProduct.name).to.be.equal(product.name);
                                expect(savedProduct.description).to.be.equal(product.description);
                                expect(savedProduct.price).to.be.equal(product.price);
                                expect(savedProduct.inStock).to.be.equal(product.inStock);


                                // 4) Verify one product in test DB
                                chai.request(server)
                                    .get('/api/products')
                                    .end((err, res) => {
                                        
                                        // Asserts
                                        expect(res.status).to.be.equal(200);                                
                                        expect(res.body).to.be.a('array');                                
                                        expect(res.body.length).to.be.eql(1);
                                
                                        done();
                                    });
                            });
                    });
            });
    });
    

    
});