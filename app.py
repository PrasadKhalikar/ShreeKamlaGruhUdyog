from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Shop, Department, Product, Order, OrderItem
from flask import request, jsonify
from werkzeug.security import generate_password_hash
from werkzeug.security import generate_password_hash
import os
import jwt
import datetime
from functools import wraps
#from dotenv import load_dotenv
#load_dotenv()

app = Flask(__name__)
CORS(app)

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
db.init_app(app)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 403
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            if not user:
                return jsonify({'message': 'Invalid token'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 403
        except Exception:
            return jsonify({'message': 'Token is invalid'}), 403
        return f(*args, **kwargs)
    return decorated


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({'status': 'ok', 'token': token})
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401


@app.route('/shops', methods=['GET'])
@token_required
def get_shops():
    shops = Shop.query.all()
    return jsonify([{'id': shop.id, 'name': shop.name} for shop in shops])


@app.route('/shops', methods=['POST'])
@token_required
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
@token_required
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
@token_required
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
@token_required
def delete_product(product_id):
    print(f"DELETE /product/{product_id} called")
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'}), 200


@app.route('/shops/<int:shop_id>', methods=['DELETE'])
@token_required
def delete_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify({'error': 'Shop not found'}), 404

    # Check if shop has orders (optional safeguard)
    linked_orders = Order.query.filter_by(shop_id=shop_id).first()
    if linked_orders:
        return jsonify({'error': 'Shop has linked orders. Cannot delete.'}), 400

    db.session.delete(shop)
    db.session.commit()
    return jsonify({'message': 'Shop deleted'}), 200


@app.route('/orders/<int:order_id>', methods=['DELETE'])
@token_required
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Delete all related order items first
    OrderItem.query.filter_by(order_id=order_id).delete()

    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Order deleted'}), 200


@app.route('/orders/<department>')
def get_orders(department):
    show_all = request.args.get('all') == 'true'

    query = (
        Order.query
        .join(Department)
        .filter(Department.name == department)
    )

    if not show_all:
        query = query.filter(~((Order.delivered == True) & (Order.paid == True)))

    orders = query.all()

    result = [{
        'id': order.id,
        'shop_name': order.shop.name,
        'total': order.total,
        'delivered': order.delivered,
        'paid': order.paid,
    } for order in orders]

    return jsonify(result)


@app.route('/order-details/<int:order_id>')
@token_required
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
@token_required
def update_order(order_id):
    data = request.get_json()
    order = Order.query.get(order_id)
    order.delivered = data.get('delivered', order.delivered)
    order.paid = data.get('paid', order.paid)
    db.session.commit()
    return jsonify({'status': 'success'})


@app.route('/create-order', methods=['POST'])
@token_required
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


@app.route('/product-summary/<department>')
def product_summary(department):
    try:
        orders = (
            db.session.query(Order)
            .join(Department)
            .filter(Department.name == department)
            .all()
        )

        product_counts = {}

        for order in orders:
            for item in order.items:
                name = item.product.name
                product_counts[name] = product_counts.get(name, 0) + item.quantity

        return jsonify([
            {"name": name, "total_quantity": qty}
            for name, qty in product_counts.items()
        ])
    except Exception as e:
        print("Error in product-summary:", e)
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


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
from waitress import serve
serve(app, host='0.0.0.0', port=8080)

