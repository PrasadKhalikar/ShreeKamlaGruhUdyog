from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Shop, Department, Product, Order, OrderItem
from flask import request, jsonify
from werkzeug.security import generate_password_hash
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return jsonify({'status': 'ok', 'message': 'Login successful'})
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401


@app.route('/shops', methods=['GET'])
def get_shops():
    shops = Shop.query.all()
    return jsonify([{'id': shop.id, 'name': shop.name} for shop in shops])


@app.route('/shops', methods=['POST'])
def add_shop():
    data = request.get_json()
    shop_name = data.get('name')

    if not shop_name:
        return jsonify({'message': 'Shop name is required', 'status': 'error'}), 400

    # Check for duplicates
    existing = Shop.query.filter_by(name=shop_name).first()
    if existing:
        return jsonify({'message': 'Shop already exists', 'status': 'error'}), 400

    new_shop = Shop(name=shop_name)
    db.session.add(new_shop)
    db.session.commit()

    return jsonify({'message': 'Shop added successfully', 'status': 'ok'})


@app.route('/add_product', methods=['POST'])
def add_product():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    dept_name = data.get('department')

    dept = Department.query.filter_by(name=dept_name.lower()).first()
    if not dept:
        dept = Department(name=dept_name.lower())
        db.session.add(dept)
        db.session.commit()

    product = Product(name=name, price=price, department=dept)
    db.session.add(product)
    db.session.commit()

    return jsonify({'message': 'Product added'}), 201


@app.route('/products/<department_name>', methods=['GET'])
def get_products(department_name):
    dept = Department.query.filter_by(name=department_name.lower()).first()
    if not dept:
        return jsonify([])

    products = Product.query.filter_by(department_id=dept.id).all()
    return jsonify([
        {'id': p.id, 'name': p.name, 'price': p.price}
        for p in products
    ])


@app.route('/product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    print(f"DELETE /product/{product_id} called")
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'}), 200


@app.route('/orders/<department>')
def get_orders(department):
    orders = (
        Order.query
        .join(Department)
        .filter(
            Department.name == department,
            ~((Order.delivered == True) & (Order.paid == True))  # only show if not both true
        )
        .all()
    )

    result = []
    for order in orders:
        result.append({
            'id': order.id,
            'shop_name': order.shop.name,
            'total': order.total,
            'delivered': order.delivered,
            'paid': order.paid,
        })

    return jsonify(result)


@app.route('/order-details/<int:order_id>')
def order_details(order_id):
    order = Order.query.get(order_id)
    return jsonify({
        'products': [
            {'id': item.id, 'name': item.product.name, 'quantity': item.quantity, 'price': item.product.price}
            for item in order.items
        ],
        'delivered': order.delivered,
        'paid': order.paid,
        'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
    })


@app.route('/update-order/<int:order_id>', methods=['POST'])
def update_order(order_id):
    data = request.get_json()
    order = Order.query.get(order_id)
    order.delivered = data.get('delivered', order.delivered)
    order.paid = data.get('paid', order.paid)
    db.session.commit()
    return jsonify({'status': 'success'})


@app.route('/create-order', methods=['POST'])
def create_order():
    data = request.get_json()

    department_name = data.get('department')
    shop_name = data.get('shop_name')
    total = data.get('total')
    items = data.get('items', [])

    # Fetch or create department
    dept = Department.query.filter(Department.name.ilike(department_name)).first()


    if not dept:
        return jsonify({'error': 'Department not found'}), 400

    # Fetch shop
    shop = Shop.query.filter(Shop.name.ilike(shop_name)).first()

    if not shop:
        return jsonify({'error': 'Shop not found'}), 400

    # Create new order
    new_order = Order(department_id=dept.id, shop_id=shop.id, total=total)
    db.session.add(new_order)
    db.session.commit()  # Commit to get order.id for foreign key

    # Add items
    for item in items:
        product_id = item.get('product_id')
        quantity = item.get('quantity')

        if not product_id or not quantity:
            continue

        product = Product.query.get(product_id)
        order_item = OrderItem(order_id=new_order.id, product_id=product_id, quantity=quantity, price=product.price)

        db.session.add(order_item)

    db.session.commit()
    return jsonify({'message': 'Order created', 'order_id': new_order.id}), 201


if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        if not User.query.first():
            admin1 = User(
                email=os.getenv("ADMIN_1_EMAIL")
            )
            admin1.set_password(os.getenv("ADMIN_1_PASSWORD"))

            admin2 = User(
                email=os.getenv("ADMIN_2_EMAIL")
            )
            admin2.set_password(os.getenv("ADMIN_2_PASSWORD"))

            admin3 = User(
                email=os.getenv("ADMIN_3_EMAIL")
            )
            admin3.set_password(os.getenv("ADMIN_3_PASSWORD"))

            db.session.add_all([admin1, admin2, admin3])
            db.session.commit()

    app.run(debug=True, host='0.0.0.0')

