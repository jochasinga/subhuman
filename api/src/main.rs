use futures::{future, Future};
use actix::*;

struct Sum(usize, usize);
impl Message for Sum {
    type Result = usize;
}

struct Summator;
impl Actor for Summator {
    type Context = Context<Self>;
}

impl Handler<Sum> for Summator {
    type Result = usize;   // <- Message response type

    fn handle(&mut self, msg: Sum, ctx: &mut Context<Self>) -> Self::Result {
        msg.0 + msg.1
    }
}

// struct MyActor;

/*
impl Actor for MyActor {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        println!("I am alive!");
        System::current().stop();
    }
}
 */

fn main() {
    let sys = System::new("test");

    let addr = Summator.start();
    let res = addr.send(Sum(10, 5));

    Arbiter::spawn(res.then(|res| {
        match res {
            Ok(result) => println!("SUM: {}", result),
            _ => println!("Someething wrong"),
        }

        System::current().stop();
        future::result(Ok(()))
    }));

    sys.run();
}
