import Foundation

@objc public class IntentAction: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
