import os

from dotenv import load_dotenv

from app.database import Base, SessionLocal, engine
from app.models import Offer, Service, Stylist, User
from app.auth import hash_password


load_dotenv()


# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()


try:

    # =========================
    # ADMIN USER
    # =========================

    admin_email = os.getenv(
        "ADMIN_EMAIL",
        "staff@xbeauty.in"
    )

    admin_password = os.getenv(
        "ADMIN_PASSWORD",
        "admin123"
    )

    existing_user = db.query(
        User
    ).filter(
        User.email == admin_email
    ).first()

    if not existing_user:

        admin = User(
            name="X Beauty Admin",
            email=admin_email,
            hashed_password=hash_password(
                admin_password
            ),
            role="admin",
            is_active=True
        )

        db.add(admin)

        print("Admin user created.")

    else:

        print("Admin user already exists.")


    # =========================
    # SERVICES
    # =========================

    if db.query(Service).count() == 0:

        services = [

            Service(
                name="Haircut",
                category="Hair",
                description="Precision haircut tailored to your style.",
                duration="45 min",
                price="₹500",
                is_active=True
            ),

            Service(
                name="Hair Styling",
                category="Hair",
                description="Professional styling for everyday and special occasions.",
                duration="45 min",
                price="₹700",
                is_active=True
            ),

            Service(
                name="Balayage",
                category="Hair Colour",
                description="Natural-looking dimensional hair colour.",
                duration="180 min",
                price="₹3,500",
                is_active=True
            ),

            Service(
                name="Men's Grooming",
                category="Grooming",
                description="Complete men's grooming service.",
                duration="60 min",
                price="₹800",
                is_active=True
            ),

            Service(
                name="Keratin Treatment",
                category="Treatments",
                description="Professional smoothing and keratin treatment.",
                duration="180 min",
                price="₹3,000",
                is_active=True
            ),

            Service(
                name="Facial",
                category="Skin & Beauty",
                description="Relaxing professional facial treatment.",
                duration="60 min",
                price="₹1,000",
                is_active=True
            )
        ]

        db.add_all(services)

        print("Services added.")


    # =========================
    # STYLISTS
    # =========================

    if db.query(Stylist).count() == 0:

        stylists = [

            Stylist(
                name="Aarav",
                specialty="Hair Styling",
                experience="8 years",
                bio="Experienced stylist specializing in modern cuts and styling.",
                image="",
                is_active=True
            ),

            Stylist(
                name="Meera",
                specialty="Hair Colour & Treatments",
                experience="6 years",
                bio="Specialist in colour transformations and hair treatments.",
                image="",
                is_active=True
            ),

            Stylist(
                name="Rohan",
                specialty="Men's Grooming",
                experience="5 years",
                bio="Specialist in men's grooming, beard styling and precision cuts.",
                image="",
                is_active=True
            )
        ]

        db.add_all(stylists)

        print("Stylists added.")


    # =========================
    # OFFERS
    # =========================

    if db.query(Offer).count() == 0:

        offers = [

            Offer(
                title="Hair Refresh",
                description="Haircut and professional styling package.",
                price="₹999",
                badge="Popular",
                features="Haircut,Wash,Styling",
                is_active=True
            ),

            Offer(
                title="Men's Grooming",
                description="Complete grooming package for men.",
                price="₹1,299",
                badge="Featured",
                features="Haircut,Beard Styling,Hair Wash",
                is_active=True
            ),

            Offer(
                title="Beauty Care",
                description="Relaxing skin and beauty care package.",
                price="₹1,499",
                badge="Special",
                features="Facial,Clean-up,Head Massage",
                is_active=True
            )
        ]

        db.add_all(offers)

        print("Offers added.")


    db.commit()

    print()
    print("===================================")
    print("X BEAUTY DATABASE SEEDED")
    print("===================================")
    print(f"Admin Email: {admin_email}")
    print(f"Admin Password: {admin_password}")
    print("===================================")


finally:

    db.close()